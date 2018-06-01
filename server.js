const render = require('./')
const express = require('express')
const app = express()

app.use('/render', async (req, res) => {
  try {
    const jpeg = await render(req.query.id)
    res.send(`
      <html>
        <head>
          <title>SilkScreen: ${req.query.id}</title>
        </head>
        <body>
          <img src="data:image/jpeg;base64, ${jpeg}" />
        </body>

      </html>
    `)
  } catch (e) {
    res.status(500).json({error: e.message})
  }
})

app.listen(1337)
