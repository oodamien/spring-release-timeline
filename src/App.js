import './styles.scss'

// Const

const date = new Date()
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// Utils

const validRelease = (release, min, max) => {
  if (release.initial > min && release.initial < max) {
    return true
  }
  if (release.migrate && release.migrate > min && release.migrate < max) {
    return true
  }
  if (release.end && release.end > min && release.end < max) {
    return true
  }
  return false
}

const validActive = (release, min, max) => {
  if (release.initial > min && release.initial < max) {
    return true
  }
  if (release.migrate && release.migrate > min && release.migrate < max) {
    return true
  }
  return false
}

const validMigrate = release => {
  if (release.end && release.migrate && release.migrate !== release.end) {
    return true
  }
  return false
}

const getDayInYear = date => {
  var start = new Date(date.getFullYear(), 0, 0)
  return (date - start) / (1000 * 60 * 60 * 24)
}

function dateDiff(first, second) {
  return (second - first) / (1000 * 60 * 60 * 24)
}

const getReleaseLeft = (date, years, scale) => {
  let left = dateDiff(new Date(`${years[0]}-01-01`), date)
  return (left / scale) * 95
}

const getReleaseWidth = (start, end, scale) => {
  return (dateDiff(start, end) / scale) * 95
}

const getFormattedDate = date => {
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

const getFormattedDateShort = date => {
  return `${date.getDate()} ${months[date.getMonth()]}`
}

const dateMin = (first, second) => {
  if (!first) {
    return second
  }
  if (!second) {
    return first
  }
  if (first > second) {
    return second
  }
  return first
}

const dateMax = (first, second) => {
  if (!first) {
    return second
  }
  if (!second) {
    return first
  }
  if (first > second) {
    return first
  }
  return second
}

const parseDate = str => {
  if (!str) {
    return ''
  }
  const arr = str.split(' ')
  if (arr.length !== 3) {
    return ''
  }
  let d = arr[0]
  let m = months.indexOf(arr[1]) + 1
  const y = arr[2]
  if (d < 10) {
    d = `0${d}`
  }
  if (m < 10) {
    m = `0${m}`
  }
  return new Date(`${y}-${m}-${d}`)
}

// Parsing table

const calendars = document.querySelectorAll('.calendar-releases')

calendars.forEach(calendar => {
  // Create Timeline

  const _timeline = document.createElement('div')
  _timeline.className = 'timeline'

  const _releasesDiv = document.createElement('div')
  _releasesDiv.className = 'releases'

  const _axisDiv = document.createElement('div')
  _axisDiv.className = 'axis'
  calendar.append(_timeline)

  _timeline.append(_releasesDiv)
  _timeline.append(_axisDiv)

  const releasesTr = calendar.querySelectorAll('table tbody tr')
  const tmp = []
  const releases = []

  // Parsing table data

  releasesTr.forEach(releaseTr => {
    const releaseTds = releaseTr.querySelectorAll('td')
    const endSupport = parseDate(releaseTds[2].innerText)
    const endCommercial = parseDate(releaseTds[3].innerText)
    const a = releaseTds[0].querySelector('a')
    let status = 'inactive'
    if (releaseTds[0].className.indexOf('migrate') > -1) {
      status = 'migrate'
    }
    if (releaseTds[0].className.indexOf('active') > -1) {
      status = 'active'
    }
    if (releaseTds[0].className.indexOf('coming') > -1) {
      status = 'coming'
    }
    tmp.push({
      name: releaseTds[0].innerText,
      status,
      link: a ? a.getAttribute('href') : '',
      initial: parseDate(releaseTds[1].innerText),
      end: endSupport > endCommercial ? endSupport : endCommercial,
    })
  })

  tmp.forEach((release, index) => {
    const next = index < tmp.length ? tmp[index + 1] : null
    let migrate = ''
    if (next) {
      if (next.initial > release.initial && next.initial < release.end) {
        migrate = next.initial
      }
    }
    releases.push({ ...release, migrate })
  })

  // Timeline Config

  const yeardisplay = 5
  const axis = Array.from({ length: yeardisplay }).map(
    (_, i) => date.getFullYear() - (yeardisplay - 2) + i
  )
  const minDate = new Date(`${axis[0]}-01-01`)
  const maxDate = new Date(`${axis[axis.length - 1]}-12-31`)
  const maxScale = axis.length * 365
  _timeline.className = `timeline t${axis.length}`

  // Axis

  Array.from({ length: axis.length + 1 }).forEach((_, index) => {
    const container = document.createElement(`div`)
    const item = document.createElement(`div`)
    item.className = 'label'
    item.append(document.createTextNode(axis[0] + index))
    container.className = 'year'
    container.append(item)
    _timeline.querySelector('.axis').append(container)
  })

  // Release

  const _releases = _timeline.querySelector('div.releases')

  releases.forEach(release => {
    const _releaseD = document.createElement('div')
    _releaseD.className = 'release'
    _releases.append(_releaseD)
    if (validRelease(release, minDate, maxDate)) {
      const label = document.createElement('div')
      label.className = `label label-release ${release.status}`
      label.addEventListener('mouseenter', event => {
        event.target.parentElement.className = 'release active'
      })
      label.addEventListener('mouseleave', event => {
        event.target.parentElement.className = 'release'
      })
      if (release.link) {
        const link = document.createElement('a')
        link.setAttribute('href', release.link)
        link.setAttribute('target', '_blank')
        link.append(document.createTextNode(release.name))
        label.append(link)
      } else {
        const span = document.createElement('span')
        span.append(document.createTextNode(release.name))
        label.append(span)
      }
      _releaseD.append(label)
      if (validActive(release, minDate, maxDate)) {
        const plopActive = document.createElement('div')
        plopActive.className = 'plop plop-active'
        plopActive.style.left = `${getReleaseLeft(
          dateMax(release.initial, minDate),
          axis,
          maxScale
        )}%`
        plopActive.style.width = `${getReleaseWidth(
          dateMax(release.initial, minDate),
          dateMin(release.migrate, maxDate),
          maxScale
        )}%`
        if (release.initial > date) {
          plopActive.className = 'plop plop-active coming'
        }

        const date1 = document.createElement('div')
        const span1 = document.createElement('span')
        span1.append(
          document.createTextNode(
            getFormattedDateShort(dateMax(release.initial, minDate))
          )
        )
        date1.className = 'date left'
        date1.append(span1)

        const date2 = document.createElement('div')
        const span2 = document.createElement('span')
        span2.append(
          document.createTextNode(
            getFormattedDateShort(dateMin(release.migrate, maxDate))
          )
        )
        date2.className = 'date right'
        date2.append(span2)

        plopActive.append(date1)
        plopActive.append(date2)
        _releaseD.append(plopActive)
      }
      if (validMigrate(release)) {
        const plopMigrate = document.createElement('div')
        plopMigrate.className = 'plop plop-migrate'
        plopMigrate.style.left = `${getReleaseLeft(
          dateMax(release.migrate, minDate),
          axis,
          maxScale
        )}%`
        plopMigrate.style.width = `${getReleaseWidth(
          dateMax(release.migrate, minDate),
          dateMin(release.end, maxDate),
          maxScale
        )}%`

        const date1 = document.createElement('div')
        const span1 = document.createElement('span')
        span1.append(
          document.createTextNode(
            getFormattedDateShort(dateMin(release.end, maxDate))
          )
        )
        date1.className = 'date right'
        date1.append(span1)

        plopMigrate.append(date1)
        _releaseD.append(plopMigrate)
      }
    } else {
      _releaseD.style.display = 'none'
    }
  })

  // Current Date

  const current = document.createElement('div')
  current.className = 'current-date'
  const currentLabel = document.createElement('div')
  currentLabel.className = 'label'
  currentLabel.append(document.createTextNode(getFormattedDate(date)))
  current.append(currentLabel)

  current.style.left = `${getReleaseLeft(new Date(), axis, maxScale)}%`
  _timeline.append(current)

  // Legend size

  let labelsWidth = 0
  _timeline.querySelectorAll('.label-release').forEach(control => {
    if (control.offsetWidth > labelsWidth) {
      labelsWidth = control.offsetWidth
    }
  })
  _timeline.querySelectorAll('.label-release').forEach(control => {
    control.style.left = `-${labelsWidth + 20}px`
  })
  _timeline.style.marginLeft = `${labelsWidth + 20}px`
})
