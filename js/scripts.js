const timezone_api = config.TIMEZONE_API; // API key for timezoneDB
const geo_api = config.GEO_API; //api for Geoapify

//API key for trueway geocoding
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '07b2509985msh667f86a94ba158dp1ec99ejsndc773f089f68',
		'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
	}
};

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
        var zone_name = ""; 
        long = position.coords.longitude;
        lat = position.coords.latitude;

        const promise1 = new Promise((resolve, reject) => {
            compute_weather(lat, long)
            resolve(); 
        })
        promise1.then((val) => {
            img_display.innerHTML = `
            <div class="btn btn-primary tooltip"> <i class="fa-regular fa-circle-question fa-xl"></i>
                <div class="top">
                 <h3>About This Page</h3>
                 <br>
                 <p>Hi, I'm Iyanna Buffaloe and this is a webpage that I designed to fetch 
                 various weather information from around the world. You can search for the weather 
                 anywhere you'd like by typing the location in the "search" bar.
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
    });
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
  
        var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${geo_api}`;
  
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
  
  function compute_weather (latitude, longitude) {
    //accessing Geoapify to get the location based off the latitude and longitude 
    const geo_base = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${geo_api}`;

    fetch(geo_base).then((response) => {
        return response.json();
    })
    .then((data) => {
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
    })

    //accessing timezoneDB to get the timezone so it can be passed into a query
    const timezone_base = `http://api.timezonedb.com/v2.1/get-time-zone?key=${timezone_api}&format=json&by=position&lat=${latitude}&lng=${longitude}`;
    fetch(timezone_base).then((response) => {
        return response.json(); 
    })
    .then((data) => {
        console.log(data);
        //getting the time so I can see if it's morning or evening later on (based on sunset)
        var unformat_time = data.formatted; 
        var cur_time = unformat_time.split(" ").pop(); 

        zone_name = data.zoneName; 

        //here, I format the zone name so that it can be passed into the query below
        var final_zone_name = zone_name.replace(/ /g,"_"); 
        var query_info = [final_zone_name, cur_time]; 
        return query_info; 
    })
    .then((query) => {
        const base = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&current_weather=true&timezone=${query[0]}`;
        fetch(base).then((response) => {
            
        return response.json();
            
        })
        .then ((data) => {
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            console.log(code);
            const description = weathercodes[Number(code)];
            const srise = data.daily.sunrise[0];
            const sset = data.daily.sunset[0];
        
            var date = srise.split("T")[0];
            var rise_time = srise.split("T").pop(); 
            var set_time = sset.split("T").pop();
            
            const sunrose = date + ", " + convert(rise_time);
            const sunset = date + ", " + convert(set_time);

            var current_time = query[1].slice(0, -3); //removing the seconds 

            //adding the search bar CSS features now that its on the screen
            searchBar.innerHTML = '<input id="autocomplete" class = "searchbar" placeholder="Enter a place.." type="text"/>';
            const s_bar = document.querySelector('#autocomplete'); 
            s_bar.style.cssText += `
            padding: 20px;
            `;


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
            return 0; 
        })
        .then ((value) => { addressAutocomplete(searchBar); 
        })
    })
  }

  function remove_results() {
    var prev_rslt = document.querySelectorAll(".addresults"); 

    for (var i = 0; i < prev_rslt.length; i++)
    {
        prev_rslt[i].remove();
     }
  }