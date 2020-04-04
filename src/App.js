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

const createDiv = ({ className }) => {
  const element = document.createElement('div')
  element.className = className || ''
  return element
}

const createAxis = ({ timeline, axis }) => {
  Array.from({ length: axis.length + 1 }).forEach((_, index) => {
    const container = createDiv({ className: 'year' })
    const item = createDiv({ className: 'label' })
    item.append(document.createTextNode(axis[0] + index))
    container.append(item)
    timeline.querySelector('.axis').append(container)
  })
  timeline.className = `timeline t${axis.length}`
}

const createCurrenDate = ({ timeline, axis, scale }) => {
  const current = createDiv({ className: 'current-date' })
  const currentLabel = createDiv({ className: 'label' })
  currentLabel.append(document.createTextNode(getFormattedDate(date)))
  current.append(currentLabel)

  current.style.left = `${getReleaseLeft(new Date(), axis, scale)}%`
  timeline.append(current)
}

const updateLegend = ({ timeline }) => {
  let labelsWidth = 0
  timeline.querySelectorAll('.label-release').forEach(control => {
    if (control.offsetWidth > labelsWidth) {
      labelsWidth = control.offsetWidth
    }
  })
  timeline.querySelectorAll('.label-release').forEach(control => {
    control.style.left = `-${labelsWidth + 20}px`
  })
  timeline.querySelectorAll('.head .content').forEach(control => {
    control.style.left = `-${labelsWidth + 20}px`
  })
  timeline.style.marginLeft = `${labelsWidth + 20}px`
}

const createReleases = ({
  timeline,
  releases,
  axis,
  minDate,
  maxDate,
  scale,
}) => {
  const _releases = timeline.querySelector('div.releases')

  releases.forEach(release => {
    const _releaseD = createDiv({ className: 'release' })
    _releases.append(_releaseD)
    if (validRelease(release, minDate, maxDate)) {
      const label = createDiv({
        className: `label label-release ${release.status}`,
      })
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
        const plopActive = createDiv({ className: 'plop plop-active' })
        plopActive.style.left = `${getReleaseLeft(
          dateMax(release.initial, minDate),
          axis,
          scale
        )}%`
        plopActive.style.width = `${getReleaseWidth(
          dateMax(release.initial, minDate),
          dateMin(release.migrate, maxDate),
          scale
        )}%`
        if (release.initial > date) {
          plopActive.className = 'plop plop-active coming'
        }

        const date1 = createDiv({ className: 'date left' })
        const span1 = document.createElement('span')
        span1.append(
          document.createTextNode(
            getFormattedDateShort(dateMax(release.initial, minDate))
          )
        )
        date1.append(span1)

        const date2 = createDiv({ className: 'date right' })
        const span2 = document.createElement('span')
        span2.append(
          document.createTextNode(
            getFormattedDateShort(dateMin(release.migrate, maxDate))
          )
        )
        date2.append(span2)

        plopActive.append(date1)
        plopActive.append(date2)
        _releaseD.append(plopActive)
      }
      if (validMigrate(release)) {
        const plopMigrate = createDiv({ className: 'plop plop-migrate' })
        plopMigrate.style.left = `${getReleaseLeft(
          dateMax(release.migrate, minDate),
          axis,
          scale
        )}%`
        plopMigrate.style.width = `${getReleaseWidth(
          dateMax(release.migrate, minDate),
          dateMin(release.end, maxDate),
          scale
        )}%`

        const date1 = createDiv({ className: 'date right' })
        const span1 = document.createElement('span')
        span1.append(
          document.createTextNode(
            getFormattedDateShort(dateMin(release.end, maxDate))
          )
        )
        date1.append(span1)

        plopMigrate.append(date1)
        _releaseD.append(plopMigrate)
      }
    } else {
      _releaseD.style.display = 'none'
    }
  })
}

// Single project

const tableReleases = document.querySelectorAll('.calendar-releases')

tableReleases.forEach(calendar => {
  // Create Timeline

  const timeline = createDiv({ className: 'timeline' })
  const _releasesDiv = createDiv({ className: 'releases' })
  const _axisDiv = createDiv({ className: 'axis' })
  calendar.append(timeline)
  timeline.append(_releasesDiv)
  timeline.append(_axisDiv)

  const trs = calendar.querySelectorAll('table tbody tr')
  const tmp = []
  const releases = []

  // Parsing table data

  trs.forEach(tr => {
    const tds = tr.querySelectorAll('td')
    const endSupport = parseDate(tds[2].innerText)
    const endCommercial = parseDate(tds[3].innerText)
    const a = tds[0].querySelector('a')
    let status = 'inactive'
    if (tds[0].className.indexOf('migrate') > -1) {
      status = 'migrate'
    }
    if (tds[0].className.indexOf('active') > -1) {
      status = 'active'
    }
    if (tds[0].className.indexOf('coming') > -1) {
      status = 'coming'
    }
    tmp.push({
      name: tds[0].innerText,
      status,
      link: a ? a.getAttribute('href') : '',
      initial: parseDate(tds[1].innerText),
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
  const scale = axis.length * 365

  // Axis
  createAxis({
    timeline,
    axis,
  })

  // Release

  createReleases({
    timeline,
    releases,
    minDate,
    maxDate,
    axis,
    scale,
  })

  // Current Date
  createCurrenDate({
    timeline,
    axis,
    scale,
  })

  // Legend size
  updateLegend({
    timeline,
  })
})

// Grouped table realeases

const groupedReleases = document.querySelectorAll('.group-releases')

groupedReleases.forEach(calendar => {
  // Create Timeline

  const timeline = createDiv({ className: 'timeline' })
  const _releasesDiv = createDiv({ className: 'releases' })
  const _axisDiv = createDiv({ className: 'axis' })
  calendar.append(timeline)
  timeline.append(_releasesDiv)
  timeline.append(_axisDiv)

  const trs = calendar.querySelectorAll('table tbody tr')
  const tmp = []
  const projects = []

  trs.forEach(tr => {
    const tds = tr.querySelectorAll('td')
    if (tds[0].className === 'head') {
      tmp.push({
        name: tds[0].innerText,
        releases: [],
      })
    } else {
      const endSupport = parseDate(tds[2].innerText)
      const endCommercial = parseDate(tds[3].innerText)
      const a = tds[0].querySelector('a')
      let status = 'inactive'
      if (tds[0].className.indexOf('migrate') > -1) {
        status = 'migrate'
      }
      if (tds[0].className.indexOf('active') > -1) {
        status = 'active'
      }
      if (tds[0].className.indexOf('coming') > -1) {
        status = 'coming'
      }
      tmp[tmp.length - 1].releases.push({
        name: tds[0].innerText,
        status,
        link: a ? a.getAttribute('href') : '',
        initial: parseDate(tds[1].innerText),
        end: endSupport > endCommercial ? endSupport : endCommercial,
      })
    }
  })

  tmp.forEach((group, index) => {
    projects.push({
      name: group.name,
      releases: [],
    })
    group.releases.forEach((release, index2) => {
      const next =
        index2 < group.releases.length ? group.releases[index2 + 1] : null
      let migrate = ''
      if (next) {
        if (next.initial > release.initial && next.initial < release.end) {
          migrate = next.initial
        }
      }
      projects[index].releases.push({ ...release, migrate })
    })
  })

  // Timeline Config

  const yeardisplay = 5
  const axis = Array.from({ length: yeardisplay }).map(
    (_, i) => date.getFullYear() - (yeardisplay - 2) + i
  )
  const minDate = new Date(`${axis[0]}-01-01`)
  const maxDate = new Date(`${axis[axis.length - 1]}-12-31`)
  const scale = axis.length * 365

  // Axis
  createAxis({
    timeline,
    axis,
  })

  // Release

  projects.forEach(project => {
    const head = createDiv({ className: 'head' })
    const headContent = createDiv({ className: 'content' })
    headContent.innerText = project.name
    head.append(headContent)
    timeline.querySelector('.releases').append(head)

    createReleases({
      timeline,
      releases: project.releases,
      minDate,
      maxDate,
      axis,
      scale,
    })
  })

  // Current Date
  createCurrenDate({
    timeline,
    axis,
    scale,
  })

  // Legend size
  updateLegend({
    timeline,
  })
})
