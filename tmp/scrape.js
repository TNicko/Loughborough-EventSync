const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const HALF_HOUR = 30

const timetableData = []

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Parses a string representing weeks in which events occur.
 *
 * @param {string} weeksString - The string containing the weeks information.
 * @returns {number[]} An array of week numbers where the event occurs.
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

// Function to parse event information from a table cell
function parseEventFromCell(cell, day, lastTimeOffset, gapDuration) {
  event_data = {
    moduleId: $(cell).find('.tt_module_id_row').text(),
    moduleName: $(cell).find('.tt_module_name_row').text(),
    type: $(cell).find('.tt_modtype_row').text(),
    lecturerName: $(cell).find('.tt_lect_row').text(),
    room: $(cell).find('.tt_room_row').first().text().replace('...', ''),
    buildingName: $($(cell).find('.tt_room_row')[1])
      .text()
      .replace(/\.\.\.|\(|\)/g, ''),
    day: day,
    timeOffset: lastTimeOffset + gapDuration,
    duration: parseInt($(cell).attr('colspan'), 10) * HALF_HOUR,
    weeks: parseWeeks($(cell).find('.tt_weeks_row').text()),
  }
  return event_data
}

// Function to extract events from a row
function extractEventsFromRow(row) {
  const day = getRowDay(row)
  let gapDuration = 0
  let lastTimeOffset = 0
  let events = []

  const cells = $(row).children('td').not('.weekday_col').get()
  cells.forEach((cell) => {
    if (
      cell.classList.contains('new_row_tt_info_cell') ||
      cell.classList.contains('tt_ingo_cell')
    ) {
      const event = parseEventFromCell(cell, day, lastTimeOffset, gapDuration)

      // Update the last time offset and reset the gap duration
      lastTimeOffset += event.duration
      gapDuration = 0

      events.push(event)
    } else {
      gapDuration += HALF_HOUR
    }
  })
  return events
}

// Function to process all rows and extract all events
function extractAllEvents(rows) {
  let allEvents = []

  // Iterate over each row to extract events
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowEvents = extractEventsFromRow(row)
    allEvents = allEvents.concat(rowEvents)
  }

  return allEvents
}

const rows = $('.tt_info_row').get()
const events = extractAllEvents(rows)
console.log(events)

/** Extracts the value of each <option> in the dropdown with ID 'P2_MY_PERIOD'. */
const optionValues = $('#P2_MY_PERIOD > option')
  .get()
  .map((x) => x.value)

console.log(optionTexts)

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

semester_num = selectSemesterAndLoad()
