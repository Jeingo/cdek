const request = require('request')
const express = require('express')

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

            if(response.requests.length == 0) {
                const company = response.entity.recipient.company
                const status = response.entity.statuses[0].name
                const info = {
                    company: company,
                    status: status
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
    for(i=0; i < Object.keys(orders).length; i++){
        const optionsGetInfOrder = {
            url: urlGetInfOrder,
            qs: {
                cdek_number: orders[i].trek
            },
            headers: {
                "Authorization": "Bearer " + token
            }
        }
            //get information
    const information = await getOrderInfo1(optionsGetInfOrder)
    finishInfo.push( {
        name: orders[i].name,
        trek: orders[i].trek,
        status: information.status,
        company: information.company
    })
    }
}

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    const info = await getOrderInfo()
    console.log(finishInfo)
    // res.render('index', {name: finishInfo[0].name,
    //                      trek: finishInfo[0].trek,
    //                      status: finishInfo[0].status,
    //                      company: finishInfo[0].company})
    res.render('index', {finishInfo})
    finishInfo.length = 0
})

app.listen(PORT, (err) => {
    if (err) {
        console.error('Error: ' + err)
    }
    console.log(`Server is started on PORT ${PORT}`)
})


