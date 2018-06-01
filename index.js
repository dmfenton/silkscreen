const path = require('path')
const puppeteer = require('puppeteer')
// const id = 'f2e9b762544945f390ca4ac3671cfa72'
// const id = '55ebf90799fa4a3fa57562700a68c405]'
const delay = require('delay')

let browser

process.on('SIGTERM', () => browser.close())
process.on('SIGINT', () => browser.close())

async function render (id) {
  if (!browser) {
    browser = await puppeteer.launch({headless: false})
  }

  const start = new Date()
  const page = await load(browser, id)
  console.log((new Date() - start) / 1000)

  const screenshot = await page.screenshot({
    type: 'jpeg'
  })

  page.close()

  return screenshot.toString('base64')
}

function load (browser, id) {
  return new Promise(async (resolve, reject) => {
    const page = await browser.newPage()
    let evaluated = false
    let interval
    let requests = []
    let idleFor = 0

    page.on('request', () => requests.push(true))

    page.on('response', () => requests.pop())

    await page.goto(`file://${path.join(__dirname, 'webmap-basic.html')}`)

    await page.evaluate(id => {
      const webmap = new window.WebMap({
        portalItem: { id }
      })

      const view = new window.MapView({ // eslint-disable-line
        map: webmap,
        container: 'viewDiv'
      })
    }, id)

    evaluated = true

    interval = setInterval(async () => {
      if (evaluated && requests.length < 1) {
        if (idleFor > 50) {
          console.log('finished network traffic')
          clearInterval(interval)
          // resolve(page)
          await waitForPageIdle(page)
          await delay(3000)
          console.log('page is idle')
          resolve(page)
        } else {
          idleFor += 10
        }
      } else {
        idleFor = 0
      }
    }, 10)
  })
}

async function waitForPageIdle (page) {
  await page.waitForFunction(async () => {
    function waitFor () {
      return new Promise(async resolve => {
        const timeoutRequested = window.performance.now() + 50
        setTimeout(() => {
          const timeoutFired = window.performance.now()
          resolve(timeoutFired - timeoutRequested)
        }, 50)
        // const timeSinceLongTask = timeoutFired - timeoutRequested < 50
        // ? timeoutFired - window.____lastLongTask : 0
      })
    }
    let timeSince
    let idleCycles = 0
    do {
      timeSince = await waitFor()
      console.log(timeSince)
      if (timeSince < 0.8) {
        idleCycles++
      } else if (idleCycles > 0) {
        idleCycles--
      }
    } while (timeSince > 0.8 || idleCycles < 6)
    return true
  })
  return page
}

module.exports = render
