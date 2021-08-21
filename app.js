const express = require('express')

const app = express()
const path = require('path')
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home', {
    meta: {
      data: {
        title: 'Jurassic-Highlands',
        description: 'template-description'
      }
    }
  })
})

app.get('/game', (req, res) => {
  res.render('pages/game', {
    meta: {
      data: {
        title: 'Jurassic-Highlands',
        description: 'template-description'
      }
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
