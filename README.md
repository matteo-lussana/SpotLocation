# SpotLocation
<img src="docs/screenshot/start.png">
Project to save spot around the world through IOS Shortcut and display them in a web page hosted by a Raspberry Pi 4.

1. [Saving](#saving)
2. [Upload](#uploading)
3. [Display](#display)
4. [Hou to use](#htu)
5. [License](#license)

## Saving <a name="saving"></a>

<div align="center" >
    <img src="docs/SaveSpot.jpg" width="500px">
</div>
The spots are locally saved in a file (/spot.txt) in JSON format and the images are locally saved in a folder (/spot_img)

## Upload <a name="uploading"></a>
### Postify

<div align="center">
    <img src="docs/PostIfy.jpg" width="500px">
</div>
Postify shortcut upload the images saved in the /spot_img on imgur, replacing the img attribute with the imgur urls and save all the spots in other two files (/final.txt and /backup.txt)

### Post

<div align="center">
    <img src="docs/Post.jpg" width="500px">
</div>

Post do a POST request to the RaspPi address in order with the JSON with all the spot and then it deletes spot.txt, final.txt and all the image saved in spot_img folder

## Display <a name="display"></a>

1. [General view](#general_view)
2. [Popup info](#popupinfo)
3. [Category list](#categoryList)
4. [Info box](#infoBox)
5. [Filters](#filters)
6. [Gallery](#gallery)
7. [Center view](#centerView)

### General view<a name="general_view"></a>
<span>
    Starting window of the site, it shows a map with all the spot marked by with a category icon.<br> On the left the control buttons.
</span>

<img src="docs/screenshot/start.png">

#### Category icon

All spots are subdivided in six categories (food, mountain, nature, water, urban, view)<br><br>

<div align="center">
    <img src="markers/marker_food.png" width="60px" title="food">
    <img src="markers/marker_mountain.png" width="60px" title="mountain">
    <img src="markers/marker_nature.png" width="60px" title="nature">
    <img src="markers/marker_water.png" width="60px" title="water">
    <img src="markers/marker_urban.png" width="60px" title="urban">
    <img src="markers/marker_view.png" width="60px" title="view">
</div>

### Popup info<a name="popupinfo"></a>

Every time the user clicks on a marker a popup will appear on the marker pressed, showing some additional information.

<img src="docs/screenshot/popupMap.png">
<img src="docs/screenshot/spotZoomInfo.png">

### Category list <a name="categoryList"></a>
<img src="menu_icons/list.png" width="50px" style="border-radius: 5px;"><br>

When the list button is pressed a popup will appear on the left, showing the list of all spots divided by category, in this list you the user can toggle the category in order to hide or show all item in the list by clicking on the category name.
   
<img src="docs/screenshot/categoryList.png">

### Info box <a name="infoBox"></a>
<img src="menu_icons/info.png" width="50px" style="border-radius: 5px;"><br>

When the info box button is pressed a popup will appear on the left, showing some information/statistic of all the database like: the numeber of spots saved for each category and the number of spots saved for each country (the latter maded using <a href="https://www.geonames.org/">GeoNames</a> API).

<img src="docs/screenshot/infoBox.png">

### Filters <a name="filters"></a>
<img src="menu_icons/filter.png" width="50px" style="border-radius: 5px;"><br>

When the filter button is pressed a popup will appear on the left, showing the list of checkboxes, one for each category.<br>Checking and unchecking a category all the spots of that category will appear or disappear.

<img src="docs/screenshot/filterOn.png">
<img src="docs/screenshot/filterOff.png">

### Gallery <a name="gallery"></a>
<img src="menu_icons/gallery.png" width="50px" style="border-radius: 5px;"><br>

When the gallert button is pressed a popup will appear on the left, showing an images gallery with all the photo uploaded on <a href="https://imgur.com/">imgur.org</a> by the <a href="#postify">ios Shortcut</a>.
On the top left there are two more buttons (<img src="menu_icons/grid_gallery.png" width="15px">, <img src="menu_icons/list_gallery.png" width="15px">) which toggle the style of the gallery: grid or list.


<img src="docs/screenshot/gallery1.png">
<img src="docs/screenshot/gallery2.png">

### Center view <a name="centerView"></a>
<img src="menu_icons/center.png" width="50px" style="border-radius: 5px;"><br>

When the gallert center button is pressed the view is gonna zoom in a precize location, in my case Italy.


## How to use <a name="htu"></a>
#### openlayer libraries

In order to make all work you have to import the library in main.js or download the library of openlayers map on their <a href="https://openlayers.org/">site</a> and move it in /lib folder.<br> (I tested all project with the 7.4.0 version)


## License <a name="license"></a>
### openlayers
<a href="https://openlayers.org/">https://openlayers.org/</a><br><br>
<span>
BSD 2-Clause License

Copyright 2005-present, OpenLayers Contributors All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</span>
### GeoNames
<a href="https://www.geonames.org/">https://www.geonames.org/</a><br><br>
<span>
Some data used in this project are from GeoNames.org. For other information consult the license Geonames: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>
</span>
