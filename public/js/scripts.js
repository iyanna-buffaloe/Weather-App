const timezone_api = config.TIMEZONE_API; // API key for timezoneDB
const geo_api = config.GEO_API; //api for Geoapify


//weathercode dictionary
var weathercodes = {
    0: "Clear Sky",
    1: "Mainly Clear", 
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Intense Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    77: "Snow Grains",
    80: "Light Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Slight Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"

}

const iconImg = document.getElementById('weather-icon');
const loc = document.querySelector('#location');
const tempC = document.querySelector('.c');
const tempF = document.querySelector('.f');
const desc = document.querySelector('.desc');
const sunriseDOM = document.querySelector('.sunrise');
const sunsetDOM = document.querySelector('.sunset');
const contain = document.querySelector('.container'); 
const searchBar = document.querySelector('#searchbar'); 
const circ = document.querySelectorAll(".circle");
const time_display = document.querySelector(".time");
const img_display = document.querySelector("#imgs");
const body = document.querySelector("body");

//convert time to standard time from military time 
function convert(input) {
    return moment(input, 'HH:mm').format('h:mm A');
}


window.addEventListener('load', ( ) => {
let long; 
let lat; 

//accessing geolocation of user
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        long = position.coords.longitude;
        lat = position.coords.latitude;
        load_page(lat,long);
    },
   function er() {
    load_page(51.509865, -0.118092) //if the user blocks the request just randomly show them what the weather is like in London.
   } );
}

});


function addressAutocomplete(containerElement) {

    /* Active request promise reject function. To be able to cancel the promise when a new request comes */
    var currentPromiseReject;
  
    /* Execute a function when someone writes in the text field: */
    const inputElement = document.querySelector('#autocomplete');

    inputElement.addEventListener('input', function(e) {
        
        remove_results(); 
        
      var currentValue = this.value; 
      
      // Cancel previous request promise
      if (currentPromiseReject) {
        currentPromiseReject({
          canceled: true
        });
      }
  
      if (!currentValue) {
        return false;
      }
  
      /* Create a new promise and send geocoding request */
      var promise = new Promise((resolve, reject) => {
        currentPromiseReject = reject;
  
        var url =  `/api/search?value=${encodeURIComponent(currentValue)}`

        fetch(url)
          .then(response => {
            // check if the call was successful
            if (response.ok) {
              response.json().then(data => {
                

                 /*create a DIV element that will contain the items (values):*/
                 var autocompleteItemsElement = document.createElement("div");
                autocompleteItemsElement.setAttribute("class", "addresults");
                containerElement.appendChild(autocompleteItemsElement);

                data.features.forEach((feature, index) => {
                    var itemElement = document.createElement("div"); 
                    itemElement.setAttribute("class", "sresult"); 
                    itemElement.innerHTML = feature.properties.formatted;
                    autocompleteItemsElement.appendChild(itemElement);


                    itemElement.onclick = function select() {
                        lat = feature.properties.lat;
                        long = feature.properties.lon;
                        remove_results();
                        compute_weather(lat, long);
                    }
                })
            });
            } else {
              response.json().then(data => reject(data));
            }
          });
      });
  
      promise.then((data) => {
          // we will process data here
      }, (err) => {
        if (!err.canceled) {
          console.log(err);
        }
      }); 
    });
  }
  
const compute_weather = async(latitude, longitude) => {
    //accessing Geoapify to get the location based off the latitude and longitude 
    const geo_base = `/api?la=${latitude}&lo=${longitude}`

    const res = await fetch(geo_base)
    const data = await res.json(); 

    var place = "";
    var city = data.features[0].properties.city;
    var state = data.features[0].properties.state; 

    if (city && state) {
        place = `${city}, ${state}`; 
        
    }
    else if (city && (!state)) {
        place = `${city}`;
    } 
    else if (!(city) && state) {
        place = `${state}`; 
    }
    else 
    {
        place = "Undefined Location"
    }

    loc.textContent = place;

    //adding the search bar CSS features now that its on the screen
    const s_bar = document.querySelector('#autocomplete'); 
    s_bar.style.visibility = "visible"
    s_bar.style.cssText += `
    padding: 20px;
    `;

    var unformat_time = data.formatted; 
    var current_time = unformat_time.split(" ").pop(); 

    const temp = data.current_weather.temperature;
    const code = data.current_weather.weathercode;

    const description = weathercodes[Number(code)];
    const srise = data.daily.sunrise[0];
    const sset = data.daily.sunset[0];

    var date = srise.split("T")[0];
    var rise_time = srise.split("T").pop(); 
    var set_time = sset.split("T").pop();
    
    const sunrose = date + ", " + convert(rise_time);
    const sunset = date + ", " + convert(set_time);


    if (current_time > set_time || current_time < rise_time)
    {
        body.style.background = ` radial-gradient(
        circle,
        rgba(209, 111, 232, 0.6334908963585435) 0%,
        rgba(65, 83, 210, 0.8407738095238095) 35%,
        rgba(92, 129, 252, 1) 100%`
        s_bar.style.borderColor = "blue";
    }
    else if (current_time < set_time && current_time > rise_time)
    {
        body.style.background = `radial-gradient(
            circle,
            rgba(251, 242, 133, 0.6334908963585435) 0%,
            rgba(224, 196, 91, 0.8407738095238095) 35%,
            rgba(230, 224, 113, 1) 100%`;
        s_bar.style.borderColor = "orange";
    }

        const fahrenheit = (temp * 9) / 5 + 32;

        desc.textContent = `${description}`;
        tempC.textContent = `${temp} °C`;
        tempF.textContent = `${fahrenheit.toFixed(2)} °F`;
        time_display.textContent = convert(current_time); 

        //adding the circles 
        for (var i = 0; i< circ.length; i++)
        {
            circ[i].style.cssText = `background-color: black;
            border-radius: 50px;
            height: 10px;
            width: 10px; 
            margin: 0 15px;`
        }
        
        sunriseDOM.textContent = `Sunrise: ${sunrose}`;
        sunsetDOM.textContent = `Sunset: ${sunset}`;
}


  function remove_results() {
    var prev_rslt = document.querySelectorAll(".addresults"); 

    for (var i = 0; i < prev_rslt.length; i++)
    {
        prev_rslt[i].remove();
     }
  }

function load_page(lat, long) { 

    const promise1 = new Promise((resolve, reject) => {
        compute_weather(lat, long);
        resolve();
    })

    promise1.then((val) => {
        
        addressAutocomplete(searchBar)

        img_display.innerHTML = `
        <div class="btn btn-primary tooltip"> <i class="fa-regular fa-circle-question fa-xl"></i>
            <div class="top">
             <h3>About This Page</h3>
             <br>
             <p>Hi, I'm Iyanna Buffaloe and this is a webpage that I designed to fetch 
             various weather information from around the world. On loading the page, the default
             destination is your location. However, if location services are blocked,
             the page will default to showing you the weather in London, England. 
             You can search for the weather anywhere you'd like by typing the location in the "search" bar.
             </p>
         </div>
    </div>
        <a href= "https://github.com/iyanna-buffaloe/Weather-App/tree/master" 
        target="_blank"><i class="fa-brands fa-github fa-xl" title="GitHub Link"></i>`;

        document.addEventListener('click', function handleClickOutsideBox(event) {
            // the element the user clicked
           
            if (!searchBar.contains(event.target)) {
                remove_results();
            }
          });
    })
  }