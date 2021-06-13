var APIKey = "0efa90e6b8a3b3bc21a824ab0b41b08b";
var submitForm = $("#submitForm");

//Local storage
var localArray = [];
var storedArray = localStorage.getItem("storedArray");
var newValidCity = false;

if(storedArray !== null){
    localArray = JSON.parse(storedArray);
}

function updateWebsite(event){
    event.preventDefault();
    var city = $("input").val();
    if(city == ""){
        return;
    }
    newValidCity = true;
    getData(city);
}

function displayHistory(){
    var history = $("#history");
    history.html("");
    $(localArray.reverse()).each(function(index){
        newEl = $("<button>")
        newEl.addClass("list-group-item list-group-item-action list-group-item-dark custom-list-group my-2");
        newEl.html(localArray[index]);
        history.append(newEl);
    });
}

//Weather data retrieval
function getData(city){
    var queryURLGeo = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    fetch(queryURLGeo).then(function(response){
        if(response.status !== 200){
            console.log("Error: " + response.status);
        }else{
            return response.json();
        }
    }).then(function(data){
        if(typeof(data[0]) != 'undefined'){
            showDisplay();
            if(newValidCity){
                newValidCity = false;
                localArray.push(city);
                localStorage.setItem("storedArray", JSON.stringify(localArray)); displayHistory();
            }
        }else{
            console.log("not a valid city")
            isValidCity = false;
            return;
        }
        let lat = data[0].lat;
        let lon = data[0].lon;
        var queryURLW = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon +"&exclude=minutely,hourly,alerts&appid=" + APIKey + "&units=metric";
        $.ajax({
            url: queryURLW,
            method: 'GET'
        }).then(function(response){
            setCurrent(response.current,city);
            setFive(response.daily);
        });
    })
}

//Weather data display
function showDisplay(){
    $(".d-none").removeClass("d-none")
}

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

function convertTime(unixdata){
    console.log(unixdata);
    let unix_timestamp = unixdata;
    var date = new Date(unix_timestamp*1000);
    var month = date.getUTCMonth()+1;
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();
    return month+"/"+day+"/"+year;
}

displayHistory();
submitForm.on("submit", updateWebsite)