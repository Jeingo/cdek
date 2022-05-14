const request = require('request')
const express = require('express')
const fs = require('fs')

const access = require('./config.json')
const orders = require('./order.json')

const app = express()

const PORT = 80

const finishInfo = []

const optionsGetToken = {
    url: 'https://api.cdek.ru/v2/oauth/token?parameters',
    form: {
        grant_type: 'client_credentials',
        client_id: access.login,
        client_secret: access.password
    }
}
const urlGetInfOrder = 'http://api.cdek.ru/v2/orders'


async function getOrderInfo1(optionsGetInfOrder) {
    return new Promise((resolve, reject) => {
        request.get(optionsGetInfOrder, (err, res, body) => {
            if(err) {
                console.error('error:', error)
                return reject(err)
            }
            const response = JSON.parse(body)
            console.log(response.entity.statuses)
            if(response.requests.length == 0) {
                const info = {
                    company: response.entity.recipient.company,
                    status: response.entity.statuses[0].name
                }
            
                return resolve(info)
            } else {
                return resolve({})
            }
         })
    })
}

async function getToken() {
    return new Promise((resolve, reject) => {
        request.post(optionsGetToken, (err, res, body) => {
            if(err) {
                console.error('error:', error)
                return reject(err)
            }
            const token = JSON.parse(body).access_token
            return resolve(token)
        })
    })
}



async function getOrderInfo() {
    //get token
    const token = await getToken()
    //make authorization
    const file = JSON.parse(fs.readFileSync('order.json', 'utf-8'))
    for(i=0; i < Object.keys(file).length; i++){
        const optionsGetInfOrder = {
            url: urlGetInfOrder,
            qs: {
                cdek_number: file[i].trek
            },
            headers: {
                "Authorization": "Bearer " + token
            }
        }
            //get information
    const information = await getOrderInfo1(optionsGetInfOrder)
    finishInfo.push( {
        name: file[i].name,
        trek: file[i].trek,
        status: information.status,
        company: information.company
    })
    }
}

app.set('view engine', 'ejs')

app.use(express.json())

app.post('/', (req, res) => {
    const file = JSON.parse(fs.readFileSync('order.json', 'utf-8'))
    const order = req.body
    file.push(order)
    const result = JSON.stringify(file)
    fs.writeFile('order.json', result, () => {})
    res.send('ok')
})

app.delete('/', (req, res) => {
    const file = JSON.parse(fs.readFileSync('order.json', 'utf-8'))
    const order = req.body
    const orderAll = file
    const test = orderAll.filter(word => word.name != order.name)
    const result = JSON.stringify(test)
    fs.writeFile('order.json', result, () => {})
    res.send('ok')
})

app.get('/', async (req, res) => {
    const info = await getOrderInfo()
    res.render('index', {finishInfo})
    finishInfo.length = 0
})

app.listen(PORT, (err) => {
    if (err) {
        console.error('Error: ' + err)
    }
    console.log(`Server is started on PORT ${PORT}`)
})


