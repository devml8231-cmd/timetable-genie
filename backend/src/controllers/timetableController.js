const { supabase } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const TimetableService = require('../services/timetableService');

/**
 * @route   POST /api/timetable/generate
 * @desc    Generate timetable for a department and semester
 * @access  Private (Admin only)
 */
const generateTimetable = asyncHandler(async (req, res, next) => {
  const { department, semester } = req.body;

  logger.info(`Starting timetable generation for ${department} - Semester ${semester}`);

  // Fetch all required data
  const [coursesResult, facultyAvailabilityResult, roomsResult, timeSlotsResult] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('department', department)
      .eq('semester', semester),
    supabase
      .from('faculty_availability')
      .select('*')
      .eq('available', true),
    supabase
      .from('rooms')
      .select('*'),
    supabase
      .from('time_slots')
      .select('*')
  ]);

  // Check for errors
  if (coursesResult.error) {
    logger.error('Error fetching courses:', coursesResult.error);
    return next(new AppError('Failed to fetch courses', 500));
  }

  if (facultyAvailabilityResult.error) {
    logger.error('Error fetching faculty availability:', facultyAvailabilityResult.error);
    return next(new AppError('Failed to fetch faculty availability', 500));
  }

  if (roomsResult.error) {
    logger.error('Error fetching rooms:', roomsResult.error);
    return next(new AppError('Failed to fetch rooms', 500));
  }

  if (timeSlotsResult.error) {
    logger.error('Error fetching time slots:', timeSlotsResult.error);
    return next(new AppError('Failed to fetch time slots', 500));
  }

  const courses = coursesResult.data;
  const facultyAvailability = facultyAvailabilityResult.data;
  const rooms = roomsResult.data;
  const timeSlots = timeSlotsResult.data;

  // Validate data
  if (courses.length === 0) {
    return next(new AppError('No courses found for this department and semester', 404));
  }

  if (rooms.length === 0) {
    return next(new AppError('No rooms available', 404));
  }

  if (timeSlots.length === 0) {
    return next(new AppError('No time slots defined', 404));
  }

  // Initialize timetable service
  const timetableService = new TimetableService(
    courses,
    facultyAvailability,
    rooms,
    timeSlots
  );

  // Generate timetable using constraint satisfaction and backtracking
  const generatedTimetable = timetableService.generate();

  if (!generatedTimetable || generatedTimetable.length === 0) {
    return next(new AppError('Failed to generate timetable. Constraints cannot be satisfied.', 400));
  }

  // Delete existing timetable for this department and semester
  await supabase
    .from('timetable')
    .delete()
    .eq('department', department)
    .eq('semester', semester);

  // Insert new timetable
  const timetableRecords = generatedTimetable.map(entry => ({
    course_id: entry.course_id,
    faculty_id: entry.faculty_id,
    room_id: entry.room_id,
    day: entry.day,
    time_slot: entry.time_slot,
    semester,
    department
  }));

  const { data: insertedData, error: insertError } = await supabase
    .from('timetable')
    .insert(timetableRecords)
    .select();

  if (insertError) {
    logger.error('Error inserting timetable:', insertError);
    return next(new AppError('Failed to save timetable', 500));
  }

  logger.info(`Timetable generated successfully for ${department} - Semester ${semester}`);

  res.status(201).json({
    success: true,
    message: 'Timetable generated successfully',
    data: {
      timetable: insertedData,
      stats: {
        total_classes: insertedData.length,
        courses_scheduled: new Set(insertedData.map(t => t.course_id)).size
      }
    }
  });
});

/**
 * @route   GET /api/timetable/:department/:semester
 * @desc    Get timetable for a department and semester
 * @access  Private
 */
const getTimetable = asyncHandler(async (req, res, next) => {
  const { department, semester } = req.params;

  logger.info(`Fetching timetable for ${department} - Semester ${semester}`);

  // First, get basic timetable data
  const { data: basicData, error: basicError } = await supabase
    .from('timetable')
    .select('*')
    .eq('department', department)
    .eq('semester', parseInt(semester));

  if (basicError) {
    logger.error('Error fetching basic timetable:', JSON.stringify(basicError));
    return next(new AppError('Failed to fetch timetable', 500));
  }

  logger.info(`Found ${basicData.length} timetable entries (basic)`);

  if (basicData.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: { timetable: [] }
    });
  }

  // Fetch all related data separately
  const courseIds = [...new Set(basicData.map(t => t.course_id))];
  const roomIds = [...new Set(basicData.map(t => t.room_id))];
  const timeSlotIds = [...new Set(basicData.map(t => t.time_slot))];
  const facultyIds = [...new Set(basicData.map(t => t.faculty_id))];

  const [coursesRes, roomsRes, timeSlotsRes, facultyRes] = await Promise.all([
    supabase.from('courses').select('*').in('id', courseIds),
    supabase.from('rooms').select('*').in('id', roomIds),
    supabase.from('time_slots').select('*').in('id', timeSlotIds),
    supabase.from('users').select('id, name, email').in('id', facultyIds)
  ]);

  // Create lookup maps
  const coursesMap = {};
  const roomsMap = {};
  const timeSlotsMap = {};
  const facultyMap = {};

  if (coursesRes.data) coursesRes.data.forEach(c => coursesMap[c.id] = c);
  if (roomsRes.data) roomsRes.data.forEach(r => roomsMap[r.id] = r);
  if (timeSlotsRes.data) timeSlotsRes.data.forEach(ts => timeSlotsMap[ts.id] = ts);
  if (facultyRes.data) facultyRes.data.forEach(f => facultyMap[f.id] = f);

  // Combine the data
  const transformedData = basicData.map(item => ({
    ...item,
    course: coursesMap[item.course_id] || null,
    faculty: facultyMap[item.faculty_id] || null,
    room: roomsMap[item.room_id] || null,
    time_slot_details: timeSlotsMap[item.time_slot] || null
  }));

  logger.info(`Transformed ${transformedData.length} entries with joins`);

  res.status(200).json({
    success: true,
    count: transformedData.length,
    data: { timetable: transformedData }
  });
});

/**
 * @route   GET /api/faculty/:id/timetable
 * @desc    Get timetable for a specific faculty
 * @access  Private
 */
const getFacultyTimetable = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { semester } = req.query;

  try {
    let query = supabase
      .from('timetable')
      .select(`
        *,
        courses!inner(id, course_name, department, weekly_hours),
        rooms!inner(id, room_name, capacity),
        time_slots!inner(id, day, start_time, end_time)
      `)
      .eq('faculty_id', id);

    if (semester) {
      query = query.eq('semester', parseInt(semester));
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching faculty timetable:', error);
      return next(new AppError('Failed to fetch timetable', 500));
    }

    // Transform the data to match expected format
    const transformedData = data.map(item => ({
      ...item,
      course: item.courses,
      room: item.rooms,
      time_slot_details: item.time_slots
    }));

    res.status(200).json({
      success: true,
      count: transformedData.length,
      data: { timetable: transformedData }
    });
  } catch (error) {
    logger.error('Failed to fetch timetable');
    return next(new AppError('Failed to fetch timetable', 500));
  }
});

/**
 * @route   DELETE /api/timetable/:department/:semester
 * @desc    Delete timetable for a department and semester
 * @access  Private (Admin only)
 */
const deleteTimetable = asyncHandler(async (req, res, next) => {
  const { department, semester } = req.params;

  const { error } = await supabase
    .from('timetable')
    .delete()
    .eq('department', department)
    .eq('semester', semester);

  if (error) {
    logger.error('Error deleting timetable:', error);
    return next(new AppError('Failed to delete timetable', 500));
  }

  logger.info(`Timetable deleted for ${department} - Semester ${semester}`);

  res.status(200).json({
    success: true,
    message: 'Timetable deleted successfully'
  });
});

module.exports = {
  generateTimetable,
  getTimetable,
  getFacultyTimetable,
  deleteTimetable
};
