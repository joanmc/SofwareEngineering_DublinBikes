COMP30670 Software Engineering Project 

Team: Michael O'Mahony, Michael Morrisroe, Joan McCarthy

Project Task: Add Occupancy Information to Dublin Bikes map

Section 1 : Data Retrieval (DataRetrieval.py)
- This section of the project makes request to the JCDecaux Dublin bikes API to request station information. A request was made every five minutes and each response was then stored in an sqlite database

Section 1.1 : DataQuery.py
- The Database Query was used to query data in the database before progressing to running a flask application (see section 2). It was mainly used for test purposes.

Section 2 :
- This section displays the data gathered in Section 1 in a web-page (dublinBikes.html). 'Flask_DatabaseQueries.py' runs a local server on which the web page can be accessed.
- NOTE: to launch the web-page open the root flask server address ('http://127.0.0.1:5000/')
- When the web-page is first opened, information for last update request in the database is displayed - markers are put in a google map for each bike station in Dublin.
- When a marker is clicked, an info window appears displaying relevant information for that station (number of bikes available, whether credit cards are accepted as a method of payment etc.)
- Additionally when a marker is clicked, three charts appear below the map
	i) A pie chart displaying the available bikes and stands for the selected station
	ii) The average availability of bikes and stands by the day of the week at that station
	iii) The average availability of bikes and stands at the station by hour of a day
			- at first this chart displays an overall average by hour for all days of the week
			- the user can then select a specific day of the week via the drop down menu to display the average hourly availability for the selected day
- Optionally, the user can search for a station via the drop down menu above the map
- Once a station is selected the info window for that station will open on the map and the relevant charts will appear for that station.
- User can continuously switch between stations by clicking on different markers or selecting a station from the drop down menu
- A check box can also be selected to show the bike lane in Dublin a the map