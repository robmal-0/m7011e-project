import express from 'express'
import path from 'path'
const PORT = 7500
const app = express()

app.use(/.*\.[a-z]+$/, (req, res) => {
    const p = path.join(__dirname, req.baseUrl)
    res.sendFile(p)
})

app.use('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Preview server listening at port ${PORT}`)
})
