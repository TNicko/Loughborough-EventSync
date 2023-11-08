const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const HALF_HOUR = 30 * 60 * 1000
const HOUR = HALF_HOUR * 2
const DAY = HOUR * 24

/**
 * Parses a string representing weeks in which sessions occur.
 *
 * @param {string} weeksString - The string containing the weeks information.
 * @returns {number[]} An array of week numbers where the session occurs.
 *
 * @example
 * // Example input string:
 * const inputString = "Sem 1: 1 - 3, 5, 8 - 10";
 * // Calling parseWeeks with the example input string returns:
 * const outputArray = parseWeeks(inputString);
 * // outputArray would be: [1, 2, 3, 5, 8, 9, 10]
 */
function parseWeeks(weeksString) {
  const weeksRanges = weeksString.match(/Sem\s+\d:\s+(.*)$/)[1].split(',')
  return weeksRanges.flatMap((range) => {
    const match = range.match(/(\d{1,2})\s+-\s+(\d{1,2})/)
    return match
      ? Array.from(
          { length: match[2] - match[1] + 1 },
          (_, i) => +match[1] + i,
        )
      : [+range.trim()]
  })
}

/**
 * Finds the weekday for a given row by traversing previous rows until
 * a row with a weekday is found.
 * Assumes that the row will have a preceding row with the weekday in it.
 *
 * @param {Object} row - The row element to find the weekday for.
 * @returns {number} - The index of the day in the DAYS array (zero-based).
 */
function getRowDay(row) {
  let dayText = null
  let currentRow = $(row)

  // Loop until the day text is found or there are no more rows to check
  while (!dayText && currentRow.length) {
    dayText = currentRow.find('.weekday').text()
    if (!dayText) {
      currentRow = currentRow.prev()
    }
  }

  return DAYS.indexOf(dayText)
}

// Function to parse session information from a table cell
function parseSessionFromCell(
  cell,
  day,
  lastDuration,
  lastTimeOffset,
  gapDuration,
) {
  session_data = {
    moduleId: $(cell).find('.tt_module_id_row').text(),
    moduleName: $(cell).find('.tt_module_name_row').text(),
    type: $(cell).find('.tt_modtype_row').text(),
    lecturerName: $(cell).find('.tt_lect_row').text(),
    room: $(cell).find('.tt_room_row').first().text().replace('...', ''),
    buildingName: $($(cell).find('.tt_room_row')[1])
      .text()
      .replace(/\.\.\.|\(|\)/g, ''),
    day: day,
    timeOffset: lastTimeOffset + lastDuration + gapDuration,
    duration: parseInt($(cell).attr('colspan'), 10) * HALF_HOUR,
    weeks: parseWeeks($(cell).find('.tt_weeks_row').text()),
  }
  return session_data
}

// Function to extract sessions from a row
function extractSessionsFromRow(row) {
  const day = getRowDay(row)
  let gapDuration = 0
  let lastTimeOffset = 0
  let lastDuration = 0
  let sessions = []

  const cells = $(row).children('td').not('.weekday_col').get()
  cells.forEach((cell) => {
    if (
      cell.classList.contains('new_row_tt_info_cell') ||
      cell.classList.contains('tt_info_cell')
    ) {
      const session = parseSessionFromCell(
        cell,
        day,
        lastDuration,
        lastTimeOffset,
        gapDuration,
      )
      console.log(gapDuration, lastTimeOffset)

      // Update the last time offset and reset the gap duration
      lastTimeOffset = session.timeOffset
      gapDuration = 0
      lastDuration = session.duration

      sessions.push(session)
    } else {
      gapDuration += HALF_HOUR
    }
  })
  return sessions
}

// Function to process all rows and extract all sessions
function extractAllSessions(rows) {
  let allSessions = []

  // Iterate over each row to extract sessions
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowSessions = extractSessionsFromRow(row)
    allSessions = allSessions.concat(rowSessions)
  }

  return allSessions
}

/** Extracts the value of each <option> in the dropdown with ID 'P2_MY_PERIOD'. */
//const optionValues = $('#P2_MY_PERIOD > option')
//.get()
//.map((x) => x.value)

//console.log(optionTexts)

// Function to select 'sem1' or 'sem2' if they exist and load the related page
function selectSemesterAndLoad() {
  var $dropdown = $('#P2_MY_PERIOD')
  var hasSem1 = $dropdown.find('option[value="sem1"]').length > 0
  var hasSem2 = $dropdown.find('option[value="sem2"]').length > 0

  if (hasSem1) {
    $dropdown.val('sem1')
    sem_num = 1
  } else if (hasSem2) {
    $dropdown.val('sem2')
    sem_num = 2
  }
  $dropdown.change()
  return sem_num
}

function createEvents(sessions, weekStartDates, timetableStart) {
  return sessions.reduce((events, session) => {
    events.push(
      ...session.weeks.map((weekNumber) => {
        const startTime =
          weekStartDates[weekNumber] +
          DAY * session.day +
          timetableStart +
          session.timeOffset

        return {
          id: `${startTime}-${session.moduleId}`,
          start: new Date(startTime),
          end: new Date(startTime + session.duration),
          summary: session.type
            ? `${session.moduleName} (${session.type})`
            : session.moduleName,
          location: session.buildingName
            ? `${session.room} (${session.buildingName})`
            : session.room,
          comment: `${session.type} for ${session.moduleName} (${session.moduleId}) with ${session.lecturerName} in room ${session.room} of ${session.buildingName}`,
        }
      }),
    )

    return events
  }, [])
}

const semester = selectSemesterAndLoad()

/** The beginning of the each week as a `Date` in the current semester. Array index equal to week number. */
const weekStartDates = [
  null,
  ...$('#P2_MY_PERIOD > option')
    .get()
    .map((x) => x.innerText)
    .filter((x) => x.includes(`Sem ${semester} - Wk`))
    .map((x) =>
      /^Sem \d - Wk \d{1,2} \(starting (\d{1,2}-[A-Z]{3}-\d{4})\)$/.exec(x),
    )
    .map((x) => new Date(x[1]).getTime()),
]

/** The start of the days as a `Date` as displayed in the timetable (generally 9AM). */
const timetableStart =
  $('.first_time_slot_col').first().text().split(':')[0] * HOUR
const rows = $('.tt_info_row').get()
const sessions = extractAllSessions(rows)
const events = createEvents(sessions, weekStartDates, timetableStart)
console.log(sessions)
console.log(events)
