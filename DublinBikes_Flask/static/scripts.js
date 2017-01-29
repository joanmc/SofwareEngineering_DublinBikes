var map,
    bikedata,
    markers = [];

// Google maps api callback function - loads google map to the page when it is opened
// map is centered on the center of Dublin
function initMap() {
    google.charts.load('current', {'packages': ['corechart', 'bar']});
     map = new google.maps.Map(document.getElementById('googleMap'), {
          center: {lat: 53.3444, lng: -6.2577},
          zoom: 13
        });
    Request();
}

// Request is called once the map has been loaded
// a Request is made to the flask server which calls the function that queries the database for the info to put on the map 
function Request() {
    var url = "http://127.0.0.1:5000/getinfo";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            bikedata = JSON.parse(xmlhttp.responseText);
            initialize(bikedata);
            formDropDown(bikedata);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// formDropDown takes all station names from the request information returned from 'Request' and puts them into a drop down menu
function formDropDown(bikedata) {
    var select = document.getElementById("stations");
    for (i = 0; i < bikedata.length; i += 1) {
        var option = document.createElement("option");
        // Station Number
        option.value = bikedata[i].number;
        // Station Name
        option.textContent = bikedata[i].name;
        select.appendChild(option);
    };
}

// Function to trigger a click on the station that was selected in the drop down menu
function showWindow() {
	// find which station was selected in the dropdown menu
    var s = document.getElementById("stations");
    var station = s.options[s.selectedIndex].value;
    // find the marker on the map for the selected station
    for (i = 0; i < markers.length; i += 1){
        if (markers[i]['stationNum'] == station) {
            selected_marker = markers[i];
            break;
        }
    }
    // trigger a click on the marker
    google.maps.event.trigger(selected_marker, 'click');
}

// puts information on the map - markers for each station and an info window containing information relevant to that station
// info windows appear when a marker is clicked
function initialize(bikedata) {
    var infowindow = new google.maps.InfoWindow();

    for (i = 0; i < bikedata.length; i += 1) {
        var stationAddress = bikedata[i].address;
        var stationName = bikedata[i].name;
        var stationNumber = bikedata[i].number;
        var stationStands = bikedata[i].bike_stands;
        var stationBikeNo = bikedata[i].available_bikes;
        var stationStandNo = bikedata[i].available_bike_stands;
        var stationBanking = bikedata[i].banking;
        if (stationBanking == true) {
            stationBanking = "Yes";
        } else {
            stationBanking = "No";
        }
        var updateTime = bikedata[i].last_update;
        var marker = new google.maps.Marker({
                position: {
                    lat : bikedata[i].position_lat,
                    lng : bikedata[i].position_lng
                },
                icon : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                map: map,
                title: bikedata[i].name,
                stationNum: bikedata[i].number
            });
        markers.push(marker);

		// set the colours of markers depending on the number of bikes available at the station
        if (stationBikeNo == 0) {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        } else if (stationBikeNo > 0 && stationBikeNo <= 5) {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
        }

        var content = "<b>Station no. </b>" + stationNumber + "<br>" + stationAddress + "<br><b>Available bikes: </b>" + stationBikeNo
                        + "<br><b>Available stands: </b>" + stationStandNo + "<br><b>Total Capacity: </b>" + stationStands
                        + "<br><b>Credit Cards Accepted: </b>" + stationBanking + "<br><b> Update Time: </b>" + updateTime;

        marker.addListener('click', function (marker, content, infowindow) {
            return function () {
                infowindow.setContent(content);
                infowindow.open(map, marker);
                drawChart(marker);
                getWeek(marker);
                getHour(marker);
            };
        }(marker, content, infowindow));
    }

}

// set the bike layer on the map when check box is selected
document.getElementById("layer").addEventListener("click", function () { mapLayer(); });
function mapLayer() {
    var bikeLayer = new google.maps.BicyclingLayer();

    if (document.form2["layer"].checked) {
        bikeLayer.setMap(map);
    } else {
        bikeLayer.setMap(map);
        bikeLayer.setMap(null);
    }
}

// Google pie chart displaying available bikes and stands at a station
function drawChart(marker) {
    var Lat,
        Lng,
        rowNum,
        j;
    
    Lat = marker.position.lat().toFixed(6);
    Lng = marker.position.lng().toFixed(6);

    for (j = 0; j < bikedata.length; j += 1) {
        if (bikedata[j].position_lat == Lat && bikedata[j].position_lng == Lng) {
            rowNum = j;
            break;
        }

    }
    
    var data = google.visualization.arrayToDataTable([
        ['STATUS', 'NUMBER'],
        ['Bikes', bikedata[rowNum].available_bikes],
        ['Stands', bikedata[rowNum].available_bike_stands]
    ]);

    var options = {
        title: 'Bike Availability',
        legend: {position: 'top'},
        colors: ['#4AC948', '#3232ff']
    };
    document.getElementById("piechart").style.display = 'block';
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);

}

// Request to flask server to get the average availability of bikes and stands at a station by day
var station_id,
    week;
function getWeek(marker) {
    station_id = marker.stationNum;
    var url = "http://127.0.0.1:5000/week/" + station_id;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            week = JSON.parse(xmlhttp.responseText);
            chartWeek(week);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Google chart to display the average availability of bikes and stands at a station by day
function chartWeek(week){
     var weekday = google.visualization.arrayToDataTable([
        ['Day', 'Bikes', 'Stands', { role: 'annotation' } ],
        ['Monday', week[0]['available_bikes']['Mon'], week[1]['available_bike_stands']['Mon'],''],
        ['Tuesday', week[0]['available_bikes']['Tue'],week[1]['available_bike_stands']['Tue'], ''],
        ['Wednesday', week[0]['available_bikes']['Wed'], week[1]['available_bike_stands']['Wed'], ''],
        ['Thursday', week[0]['available_bikes']['Thurs'], week[1]['available_bike_stands']['Thurs'], ''],
        ['Friday', week[0]['available_bikes']['Fri'],week[1]['available_bike_stands']['Fri'], ''],
        ['Saturday', week[0]['available_bikes']['Sat'],week[1]['available_bike_stands']['Sat'], ''],
        ['Sunday', week[0]['available_bikes']['Sun'],week[1]['available_bike_stands']['Sun'], '']
      ]);

      var options = {
          title: 'Average Bike Availability by Weekday',
          isStacked: 'percent',
          legend: {position: 'top'},
          colors: ['#4AC948', '#3232ff'],
          vAxis: {
            minValue: 0
          }
        };

    document.getElementById("piechart2").style.display = 'block';
    var chart = new google.visualization.ColumnChart(document.getElementById('piechart2'));
    chart.draw(weekday, options);
}

// Request to flask server to get the average availability of bikes and stands at a station over all days of the week
var hour;
function getHour(marker) {
    var station_id = marker.stationNum;
    var url = "http://127.0.0.1:5000/hour/" + station_id;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            hour = JSON.parse(xmlhttp.responseText);
            chartHour(hour);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Request to flask server to get the average availability of bikes and stands at a station for a particular day
var dayHour;
function getDayHour() {
	// find which day was selected in the drop down menu
    var d = document.getElementById("day");
    var day_index = d.options[d.selectedIndex].value;
    
    var url = "http://127.0.0.1:5000/hour/" + station_id + "/" + day_index;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            dayHour = JSON.parse(xmlhttp.responseText);
            chartHour(dayHour);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Google chart to display the average availability of bikes and stands at a station by hour
function chartHour(hour){
     var hourly = google.visualization.arrayToDataTable([
        ['Time', 'Bikes', 'Stands', { role: 'annotation' } ],
        ['00:00', hour[0]['available_bikes']['0'], hour[1]['available_bike_stands']['0'],''],
        ['01:00', hour[0]['available_bikes']['1'],hour[1]['available_bike_stands']['1'], ''],
        ['02:00', hour[0]['available_bikes']['2'], hour[1]['available_bike_stands']['2'], ''],
        ['03:00', hour[0]['available_bikes']['3'], hour[1]['available_bike_stands']['3'], ''],
        ['04:00', hour[0]['available_bikes']['4'],hour[1]['available_bike_stands']['4'], ''],
        ['05:00', hour[0]['available_bikes']['5'],hour[1]['available_bike_stands']['5'], ''],
        ['06:00', hour[0]['available_bikes']['6'],hour[1]['available_bike_stands']['6'], ''],
        ['07:00', hour[0]['available_bikes']['7'],hour[1]['available_bike_stands']['7'], ''],
        ['08:00', hour[0]['available_bikes']['8'],hour[1]['available_bike_stands']['8'], ''],
        ['09:00', hour[0]['available_bikes']['9'],hour[1]['available_bike_stands']['9'], ''],
        ['10:00', hour[0]['available_bikes']['10'],hour[1]['available_bike_stands']['10'], ''],
        ['11:00', hour[0]['available_bikes']['11'],hour[1]['available_bike_stands']['11'], ''],
        ['12:00', hour[0]['available_bikes']['12'],hour[1]['available_bike_stands']['12'], ''],
        ['13:00', hour[0]['available_bikes']['13'],hour[1]['available_bike_stands']['13'], ''],
        ['14:00', hour[0]['available_bikes']['14'],hour[1]['available_bike_stands']['14'], ''],
        ['15:00', hour[0]['available_bikes']['15'],hour[1]['available_bike_stands']['15'], ''],
        ['16:00', hour[0]['available_bikes']['16'],hour[1]['available_bike_stands']['16'], ''],
        ['17:00', hour[0]['available_bikes']['17'],hour[1]['available_bike_stands']['17'], ''],
        ['18:00', hour[0]['available_bikes']['18'],hour[1]['available_bike_stands']['18'], ''],
        ['19:00', hour[0]['available_bikes']['19'],hour[1]['available_bike_stands']['19'], ''],
        ['20:00', hour[0]['available_bikes']['20'],hour[1]['available_bike_stands']['20'], ''],
        ['21:00', hour[0]['available_bikes']['21'],hour[1]['available_bike_stands']['21'], ''],
        ['22:00', hour[0]['available_bikes']['22'],hour[1]['available_bike_stands']['22'], ''],
        ['23:00', hour[0]['available_bikes']['23'],hour[1]['available_bike_stands']['23'], '']
      ]);

      var options = {
          title: 'Average Bike Availability by Hour',
          isStacked: 'percent',
          legend: {position: 'top'},
          colors: ['#4AC948', '#3232ff'],
          vAxis: {
            minValue: 0
          }
        };


    document.getElementById("dropdown").style.display = 'block';
    var chart = new google.visualization.ColumnChart(document.getElementById('piechart3'));
    chart.draw(hourly, options);
}