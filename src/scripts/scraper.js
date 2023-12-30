export async function getEvents(semester) {
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

  function getRowDay(row) {
    let dayText = null
    let currentRow = row

    while (!dayText && currentRow) {
      const weekdayElem = currentRow.querySelector('.weekday')
      dayText = weekdayElem ? weekdayElem.textContent : null
      if (!dayText) {
        currentRow = currentRow.previousElementSibling
      }
    }

    return DAYS.indexOf(dayText)
  }

  function parseSessionFromCell(
    cell,
    day,
    lastDuration,
    lastTimeOffset,
    gapDuration,
  ) {
    const session_data = {
      moduleId: cell.querySelector('.tt_module_id_row').textContent,
      moduleName: cell.querySelector('.tt_module_name_row').textContent,
      type: cell.querySelector('.tt_modtype_row').textContent,
      lecturerName: cell.querySelector('.tt_lect_row').textContent,
      room: cell.querySelector('.tt_room_row').textContent.replace('...', ''),
      buildingName: cell
        .querySelectorAll('.tt_room_row')[1]
        .textContent.replace(/\.\.\.|\(|\)/g, ''),
      day: day,
      timeOffset: lastTimeOffset + lastDuration + gapDuration,
      duration: parseInt(cell.getAttribute('colspan'), 10) * HALF_HOUR,
      weeks: parseWeeks(cell.querySelector('.tt_weeks_row').textContent),
    }
    return session_data
  }

  function extractSessionsFromRow(row) {
    const day = getRowDay(row)
    let gapDuration = 0
    let lastTimeOffset = 0
    let lastDuration = 0
    let sessions = []

    const cells = row.querySelectorAll('td:not(.weekday_col)')
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

  function extractAllSessions(rows) {
    let allSessions = []
    rows.forEach((row) => {
      const rowSessions = extractSessionsFromRow(row)
      allSessions = allSessions.concat(rowSessions)
    })
    return allSessions
  }

  function selectSemesterAndLoad(semester) {
    return new Promise((resolve, reject) => {
      const dropdown = document.getElementById('P2_MY_PERIOD')
      const semesterOptions = {
        sem1: { value: 'sem1', num: 1 },
        sem2: { value: 'sem2', num: 2 },
      }

      const selectedOption = semesterOptions[semester]

      if (
        !selectedOption ||
        dropdown.querySelector(`option[value="${selectedOption.value}"]`) ===
          null
      ) {
        reject(
          `Semester '${selectedOption.num}' is not available on the timetable at the moment`,
        )
        return
      }

      dropdown.value = selectedOption.value
      dropdown.dispatchEvent(new Event('change'))

      // Set a timeout to wait for the page to process the change
      setTimeout(() => {
        resolve({ sem_num: selectedOption.num })
      }, 1000)
    })
  }

  function createEvents(sessions, weekStartDates, timetableStart) {
    return sessions.reduce((events, session) => {
      session.weeks.forEach((weekNumber) => {
        const startTime =
          weekStartDates[weekNumber - 1] +
          DAY * session.day +
          timetableStart +
          session.timeOffset
        events.push({
          //id: `${startTime}-${session.moduleId}`,
          start: new Date(startTime).toISOString(),
          end: new Date(startTime + session.duration).toISOString(),
          summary: session.type
            ? `${session.moduleName} (${session.type})`
            : session.moduleName,
          location: session.buildingName
            ? `${session.room} (${session.buildingName})`
            : session.room,
          comment: `${session.type} for ${session.moduleName} (${session.moduleId}) with ${session.lecturerName} in room ${session.room} of ${session.buildingName}`,
        })
      })
      return events
    }, [])
  }

  try {
    const semesterResponse = await selectSemesterAndLoad(semester)
  } catch (error) {
    if (typeof error === 'string') {
      return { error }
    } else {
      return { error: 'Could not find Semester schedule.' }
    }
  }

  const weekStartDates = Array.from(
    document.getElementById('P2_MY_PERIOD').options,
  )
    .map((option) =>
      option.innerText.match(
        /^Sem \d - Wk \d{1,2} \(starting (\d{1,2}-[A-Z]{3}-\d{4})\)$/,
      ),
    )
    .filter((x) => x)
    .map((x) => new Date(x[1]).getTime())

  const timetableStart =
    parseInt(
      document.querySelector('.first_time_slot_col').textContent.split(':')[0],
      10,
    ) * HOUR
  const rows = document.querySelectorAll('.tt_info_row')
  const sessions = extractAllSessions(rows)
  const events = createEvents(sessions, weekStartDates, timetableStart)
  return { events: events }
}
