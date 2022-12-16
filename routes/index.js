const express = require('express'); 
const router = express.Router(); 
const needle = require('needle')
const url = require('url');

module.exports = router

const GEO_API_KEY = process.env.GEO_API;
const TIMEZONE_API_KEY = process.env.TIMEZONE_API; 

router.get('/', async (req, res) => {

    var latitude = url.parse(req.url, true).query.la;
    var longitude = url.parse(req.url, true).query.lo;

    try {
        const geoRes = await needle('get', `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEO_API_KEY}`) 
        const timezoneRes = await needle('get' , `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`)
        
        const timedata = timezoneRes.body;
        const geodata = geoRes.body; 

       const weatherRes = await needle('get', `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&current_weather=true&timezone=${timedata.zoneName}`)
       const weatherdata = weatherRes.body; 

       const data = Object.assign(timedata, geodata, weatherdata);
        res.json(data);
    }
    catch (error)
    {
        res.status(500).json({error}); 
    }
    
})

router.get('/search', async (req, res) => {
    var currentVal = url.parse(req.url, true).query.value;

    try {
        const searchRes = await needle('get', `https://api.geoapify.com/v1/geocode/autocomplete?text=${currentVal}&limit=5&apiKey=${GEO_API_KEY}`)
        const searchdata = searchRes.body; 
        res.json(searchdata);
    }
    catch {
        res.status(500).json({error}); 
    }
})