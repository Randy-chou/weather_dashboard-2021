//Retrieve useful elements from DOM
var APIKey = "0efa90e6b8a3b3bc21a824ab0b41b08b";
var submitForm = $("#submitForm");
var clearButton = $("#clear");
var newHistory = $("#history");

//Local storage
var localArray = [];
var storedArray = localStorage.getItem("storedArray");
var newValidCity = false;

if(storedArray !== null){
    localArray = JSON.parse(storedArray);
}

//Upon submitting an input city, updates local storage and displays weather data
function updateWebsite(event){
    event.preventDefault();
    var city = $("input").val();
    if(city == ""){
        return;
    }
    newValidCity = true;
    getData(city);
}

//Helper function for displaying what is currently 
function displayHistory(){
    newHistory.html("");
    $(localArray.reverse()).each(function(index){
        newEl = $("<button>")
        newEl.addClass("list-group-item list-group-item-action list-group-item-dark custom-list-group my-2");
        newEl.html(localArray[index]);
        newHistory.append(newEl);
    });
}

//Helper function for weather data retrieval 
function getData(city){
    var queryURLGeo = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;

    //Translate inputed city to lat and long coordinates
    fetch(queryURLGeo).then(function(response){
        //Check for any retrieval errors
        if(response.status !== 200){
            console.log("Error: " + response.status);
        }else{
            return response.json();
        }
    }).then(function(data){
        //Check if any data was returned or if the inputed city does not exist
        if(typeof(data[0]) != 'undefined'){
            showDisplay();
            if(newValidCity){
                newValidCity = false;
                $("input").val("");
                $("input").attr("placeholder", "");
                localArray.push(city);
                localStorage.setItem("storedArray", JSON.stringify(localArray)); displayHistory();
            }
        }else{
            console.log("not a valid city")
            isValidCity = false;
            $("input").val("");
            $("input").attr("placeholder", "not a valid city, try again?");
            return;
        }
        let lat = data[0].lat;
        let lon = data[0].lon;
        //Using the lat and lon data, get the current and future weather for the city
        var queryURLW = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon +"&exclude=minutely,hourly,alerts&appid=" + APIKey + "&units=metric";
        $.ajax({
            url: queryURLW,
            method: 'GET'
        }).then(function(response){
            //Helper functions to update webpage using data
            setCurrent(response.current,city);
            setFive(response.daily);
        });
    })
}

//When clicking an item in the search history, updates the weather data section
function getHistory(event){
    var target = $(event.target);
    if(target.is("button")){
        getData(target.text());
    }
}

//Clear local storage of past search history
function clearHistory(){
    localArray = [];
    localStorage.setItem("storedArray", JSON.stringify(localArray));
    displayHistory();
}

//Bring the weather data section of the website out of hiding
function showDisplay(){
    $(".d-none").removeClass("d-none")
}

//Updates the weather data section to show the current weather conditions
function setCurrent(data,city){
    console.log(data);
    var iconURL = "http://openweathermap.org/img/w/"+data.weather[0].icon+".png"
    console.log(iconURL);
    $("#primary").children("div").children("img").attr('src', iconURL);
    $("#primary").children("div").children("h2").text(city + "(" + convertTime(data.dt) + ")");
    $("#temp").text(data.temp);
    $("#wind").text(data.wind_speed);
    $("#humid").text(data.humidity);
    var uvi = data.uvi
    $("#UVI").text(uvi);
    $("#UVI").removeClass("vhigh high mod low");
    if(uvi >= 7){
        $("#UVI").addClass("vhigh");
    }else if(uvi >= 5){
        $("#UVI").addClass("high");
    }else if(uvi >= 2){
        $("#UVI").addClass("mod");
    }else{
        $("#UVI").addClass("low");
    }
}

//Updates the weather data section to show the future forcasts
function setFive(data){
    console.log(data);
    for(var i = 0; i < 5; i++){
        var dayInfo = data[i+1];
        var iconURL = "http://openweathermap.org/img/w/"+dayInfo.weather[0].icon+".png"
        var card = $("#futureinfo").children().eq(i);
        $(card).children().eq(0).text(convertTime(dayInfo.dt));
        $(card).children().eq(1).attr('src', iconURL)
        $(card).children().eq(2).children().text(dayInfo.temp.day);
        $(card).children().eq(3).children().text(dayInfo.wind_speed);
        $(card).children().eq(4).children().text(dayInfo.humidity);
    }
}

//Converts unix time to the corresponding date.
function convertTime(unixdata){
    console.log(unixdata);
    let unix_timestamp = unixdata;
    var date = new Date(unix_timestamp*1000);
    var month = date.getUTCMonth()+1;
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();
    return month+"/"+day+"/"+year;
}

//Initial website set up
displayHistory();
submitForm.on("submit", updateWebsite)
newHistory.on("click", getHistory)
clearButton.on("click", clearHistory);
