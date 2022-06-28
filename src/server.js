const express = require('express')
const fs = require('fs').promises
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const app = express()
const port = 3001

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }

//Server Endpoints
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

app.get('/login', async (req, res) => {
    console.log('Starting to Login')
    const email = req.query.email
    const password = req.query.pass
    const response = await login(email, password)

    if (response ==true) { 
        res.send('Sucessfully logged in')
    } else {
        res.statusCode = 201
        res.send('There was a problem logging in')
    }
})

app.get('/school_login', async (req, res) => {
    //This is the endpoint for the hopefully school-credential login
})

app.get('/get_classes', async(req,res) => {
    console.log('Scrapping the Classees')
    const data = await get_classes()
    if (data==false){
        res.statusCode = 201
        res.send('There was an error scrapping Classes')
    }
    // classes = await parseClasses(data['data'])
    res.send(data)
    
})

app.get('/get_assignments', async(req, res) => {
    console.log('Getting assignments')
    const course_id = req.query.id
    console.log('Course id is ' + course_id)
    const data = await get_assignments(course_id)
    if (data==false) {
        res.statusCode = 201
        res.send('There was an error getting the assignments')
    }
    res.send(data)
})


//Scrapping Functions 
async function login(email, password) {
    //First we create a new browser and page instance
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.gradescope.com/login')
    await page.waitForSelector('input[name=commit]')

    await page.type('#session_email', email)
    await page.type('#session_password', password)
    await page.click('input[name=commit]')
    await page.waitForNavigation()

    let response = await page.goto('https://www.gradescope.com/account')
    const url = await page.url()

    //This checks if the url is the account url becuase if so that means that
    //users have sucessfully logged in 
    if (url!= 'https://www.gradescope.com/account') {
        console.log('There was an error corresponding to login information')
        browser.close()
        return false
    }

    //Then we save the cookies so we can load it in other functions rather than constnatly needing to login


    const cookies = await page.cookies()
    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2))
    browser.close()
    return true
}


async function get_classes() {
    try {
        const cookiesString = await fs.readFile('./cookies.json')
        const cookies = JSON.parse(cookiesString)
    
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setCookie(...cookies)
        await page.goto('https://www.gradescope.com/account')
    
        const data = await page.evaluate(() => document.documentElement.outerHTML)
        browser.close()
        // console.log(data)
        return data
    } catch(e) {
        console.log(e)
        browser.close()
        return false
    }

}

async function get_assignments(id) {
    try {
        const cookiesString = await fs.readFile('./cookies.json')
        const cookies = JSON.parse(cookiesString)
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setCookie(...cookies)
        await page.goto('https://www.gradescope.com'+id)
        
        const data = await page.evaluate(() => document.documentElement.outerHTML)
        browser.close()
        return data
    } catch (e){
        console.log(e)
        return false
    }
}

//Parsing Functions 


//This function may be re-worked depending on how we want to get data and how this wants to be used


 