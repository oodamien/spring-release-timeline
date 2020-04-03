// alert('ok')

import './styles.scss'

const date = new Date()
const yeardisplay = 5

const axis = Array.from({ length: yeardisplay }).map((_, i) => {
  return date.getFullYear() - (yeardisplay - 2) + i
})

const minDate = new Date(`${axis[0]}-01-01`)
const maxDate = new Date(`${axis[axis.length - 1]}-12-31`)
const maxScale = axis.length * 365
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

const parseDate = str => {
  if (!str) {
    return
  }
  const arr = str.split('-')
  if (arr.length !== 3) {
    return
  }
  return new Date(`${arr[2]}-${arr[0]}-${arr[1]}`)
}

const validRelease = release => {
  if (release.initial > minDate && release.initial < maxDate) {
    return true
  }
  if (
    release.migrate &&
    release.migrate > minDate &&
    release.migrate < maxDate
  ) {
    return true
  }
  if (release.end && release.end > minDate && release.end < maxDate) {
    return true
  }
  return false
}

const validActive = release => {
  if (release.initial > minDate && release.initial < maxDate) {
    return true
  }
  if (
    release.migrate &&
    release.migrate > minDate &&
    release.migrate < maxDate
  ) {
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

const getReleaseLeft = date => {
  let left = dateDiff(new Date(`${axis[0]}-01-01`), date)
  return (left / maxScale) * 95
}

const getReleaseWidth = (start, end) => {
  return (dateDiff(start, end) / maxScale) * 95
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

// Main Config
document.querySelector('#timeline').className = `timeline t${axis.length}`

// Axis

Array.from({ length: axis.length + 1 }).forEach((_, index) => {
  const container = document.createElement(`div`)
  const item = document.createElement(`div`)
  item.className = 'label'
  item.append(document.createTextNode(axis[0] + index))
  container.className = 'year'
  container.append(item)
  document.querySelector('#timeline .axis').append(container)
})

// Release

const _releases = document.querySelectorAll('#timeline div.release')
_releases.forEach(_release => {
  const release = {
    name: _release.dataset['release'],
    initial: parseDate(_release.dataset['initial']),
    migrate: parseDate(_release.dataset['migrate']),
    end: parseDate(_release.dataset['end']),
    link: _release.dataset['link'],
    status: _release.dataset['status'],
  }

  if (validRelease(release, axis)) {
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
    _release.append(label)
    if (validActive(release)) {
      const plopActive = document.createElement('div')
      plopActive.className = 'plop plop-active'
      plopActive.style.left = `${getReleaseLeft(
        dateMax(release.initial, minDate)
      )}%`
      plopActive.style.width = `${getReleaseWidth(
        dateMax(release.initial, minDate),
        dateMin(release.migrate, maxDate)
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
      _release.append(plopActive)
    }
    if (validMigrate(release)) {
      const plopMigrate = document.createElement('div')
      plopMigrate.className = 'plop plop-migrate'
      plopMigrate.style.left = `${getReleaseLeft(
        dateMax(release.migrate, minDate)
      )}%`
      plopMigrate.style.width = `${getReleaseWidth(
        dateMax(release.migrate, minDate),
        dateMin(release.end, maxDate)
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
      _release.append(plopMigrate)
    }
  } else {
    _release.style.display = 'none'
  }
})

// Current Date

const current = document.createElement('div')
current.className = 'current-date'
const currentLabel = document.createElement('div')
currentLabel.className = 'label'
currentLabel.append(document.createTextNode(getFormattedDate(date)))
current.append(currentLabel)

current.style.left = `${getReleaseLeft(new Date())}%`
document.querySelector('#timeline').append(current)

// Legend size

let labelsWidth = 0
document.querySelectorAll('.label-release').forEach(control => {
  if (control.offsetWidth > labelsWidth) {
    labelsWidth = control.offsetWidth
  }
})
document.querySelectorAll('.label-release').forEach(control => {
  control.style.left = `-${labelsWidth + 20}px`
})
document.querySelector('#timeline').style.marginLeft = `${labelsWidth + 20}px`
