//-------------UTILS-------------------------

var obj;
var posizioni;
var lock = true;

config = {
  GeoNamesUser: "GeoNamesUserName"
}

function getCountry(element){
  return new Promise((resolve, reject) => {
    fetch(element.url)
      .then(response => response.json())
      .then(data => {
        // Estrai il nome del paese dalla risposta JSON
        if(data.geonames != undefined)
          var state = data.geonames[0].countryName;
        else var state = "Italy";
        element.spot.country = state
        resolve()
      })
      .catch(error => {
        console.error("ERROR: " ,error);
      });
  });
}



//----------PROGRAM TRIGGER----------------
window.onload = async function(){
  try{
    await prova();
    init();
  }catch(error){
    console.log(error)
  }
};

prova = async function(){
  try{
    await query();
    prepare();
  }catch(error){
    console.log(error)
  }
}

async function query(){
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open( "GET", "Raspberry pi url");
    xhr.onload = function() {
      if (xhr.status === 200) {
        // La richiesta è andata a buon fine
        posizioni = JSON.parse(xhr.responseText);
        console.log(posizioni);
        resolve()
      } else {
        // La richiesta ha fallito
        console.log("Errore: " + xhr.status);
        reject()
      }
    };
    xhr.send();
  });
  
  await promise
}


//function that prepare each spot (receive them from database and add information with some APIs)
async function prepare(){
  
  
  
  console.log("func: prepare()")

  //parse the file text received
  console.log("ricevuto tutto")
  console.log(posizioni)
  obj = posizioni

  


  requested_coordinates = []

  for(let i=0; i<obj.spots.length; i++){
    lat = Math.round(obj.spots[i].lat);
    lng = Math.round(obj.spots[i].lng);
    var element = {}
    var apiUrl = 'http://api.geonames.org/findNearbyJSON?lat='+lat+'&lng='+lng+'&username='+config.GeoNamesUser;

    element.spot = obj.spots[i];
    element.url = apiUrl;
    requested_coordinates.push(element);
  }

  const promessa = requested_coordinates.map(element => getCountry(element))
  
  await Promise.all(promessa);
  
}


function init(){
  console.log("func: init()")
  //CREATE THE MAP OBJ

  const map = new ol.Map({
    view: new ol.View({
      center: [0, 0],
      zoom: 5   
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    target: 'js-map'
  });
  
  //center on italy
  map.getView().setCenter(ol.proj.fromLonLat([
    parseFloat(9), parseFloat(45)
  ]))


  //initalize some useful list (marker, all spots and a list for each category)
  const markers = [];
  const spots = []; 

  //create a marker for each spot
  for(let i=0; i<obj.spots.length; i++){
    const marker = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat([obj.spots[i].lng, obj.spots[i].lat])
            ),
            attributes:{
              name: obj.spots[i].name,
              category: obj.spots[i].ctg,
              altitude: obj.spots[i].alt,
              image: obj.spots[i].img,
              description: obj.spots[i].desc,
            }
          })
        ]
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          src: './markers/marker_'+obj.spots[i].ctg+'.png',
          scale: 0.3
        })       
      })
    })
    
    spots.push(obj.spots[i]);
    marker.set('category',obj.spots[i].ctg)
    markers.push(marker);
    
    
  }

  //add all markers to the map
  markers.forEach(marker=>map.addLayer(marker))
  
  //manage the overlay (section that popup when the marker is pressed)
  const overlayContainerElement = document.querySelector('.overlay-container');
  const overlayLayer = new ol.Overlay({
    element: overlayContainerElement
  })

  map.addOverlay(overlayLayer);
  const overlayFeatureName = document.getElementById('feature-name');
  const overlayFeatureIcon = document.getElementById('feature-icon');
  const overlayFeatureImage = document.getElementById('feature-image');
  const overlayFeatureInfo = document.getElementById('feature-info');
  const overlayFeatureDesc = document.getElementById('feature-desc');

  //handle the user click
  map.on('click', function(e){
    //delete the previous overlay
    overlayLayer.setPosition(undefined)

    //implements the frature
    map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
      //get the coordinates of the spot and make the overlay appears near the spot
      let clickedCoordinate = e.coordinate;
      overlayLayer.setPosition(clickedCoordinate);

      //setting up parameter in the overlay panel
      //name
      overlayFeatureName.innerHTML = feature.get('attributes').name;

      //photo
      let url = "https://i.imgur.com/" + feature.get('attributes').image + ".jpg";
      overlayFeatureImage.innerHTML = '<img id=\"feature-image\"width=\"100px\" height=\"100px\" src=\"'+ url +'\">';
      
      //category icon
      overlayFeatureIcon.innerHTML = 'cat: '+ 
        '<img width=\"20px\" height=\"20px\" src=\"'+ './markers/marker_'+feature.get('attributes').category+'.png' +'\">';

      //spot info (alt)
      overlayFeatureInfo.innerHTML = 'alt: '+
        Number((parseInt(feature.get('attributes').altitude)).toFixed(2))+' m';

      //descriptions
      overlayFeatureDesc.innerHTML = feature.get('attributes').description

    })
  })

  console.log(spots)

  //CREATE SUB LIST
  //function to organize the spots in a JSON divided by category and country
  spot_list_by_ctg = {};
  ctg_list = [];
  ctg_list_counter = [];

  spot_list_by_country = {};
  country_list = [];
  country_list_counter = [];
  createSubList()
  function createSubList(){
    console.log("entrato")
    spots.forEach(spot => {
    let added = 0;
    let temp_ctg = spot.ctg
    //search the category in the list
    for(let i=0; i<ctg_list.length; i++){
      if(spot.ctg == ctg_list[i]) {
        //if and when finded: increment the category counter and add in the correct position of the JSON
        ctg_list_counter[i]++;
        spot_list_by_ctg[temp_ctg][ctg_list_counter[i]-1] = spot;
        added = 1;
        break;
      }
    }
    //if not finded
    if(added == 0){
      //add the category in the category list and the section in the JSON
      ctg_list.push(spot.ctg);
      ctg_list_counter.push(1);
      spot_list_by_ctg[temp_ctg] = [];
      spot_list_by_ctg[temp_ctg][0] = spot;
    }

    added = 0;
    let temp_country = spot.country
    //search the country in the list
    for(let i=0; i<country_list.length; i++){
      if(spot.country == country_list[i]) {
        console.log("entrato")
        //if and when finded: increment the country counter and add in the correct position of the JSON
        country_list_counter[i]++;
        spot_list_by_country[temp_country][country_list_counter[i]-1] = spot;
        added = 1;
        break;
      }
    }
    //if not finded
    if(added == 0){
      //add the country in the country list and the section in the JSON
      console.log("creo con: "+ spot.country)
      country_list.push(spot.country);
      country_list_counter.push(1);
      spot_list_by_country[temp_country] = [];
      spot_list_by_country[temp_country][0] = spot;
    }
  })
  }
  
  console.log(ctg_list);
  console.log(ctg_list_counter);
  console.log(spot_list_by_ctg);

  console.log(country_list);
  console.log(spot_list_by_country);
  
  
  //---------------MENU' MANAGER------------

  menu_btn_list = []; //list with all the div that can popup
  var filters = document.getElementById("map-filter");
  var category_list = document.getElementById("map-list");
  var infobox = document.getElementById("map-info");
  var gallery = document.getElementById("map-gallery");

  menu_btn_list.push(filters, category_list, infobox, gallery);

  //hide all div in the list
  menu_btn_list.forEach(div => {
    div.style.display = "none";
  })

  //function to make the selected div appear and hid the others
  function toggle_popup(btn){
    let btnID = btn.className.replace("menu_btn ", "");
    for(let i=0; i<menu_btn_list.length; i++){
      let divID = menu_btn_list[i].id.replace("map-","");
      if(btnID == divID){
        if(menu_btn_list[i].style.display == "none")
          menu_btn_list[i].style.display = "block";
        else menu_btn_list[i].style.display = "none";
      }
      else menu_btn_list[i].style.display = "none";
    }
  }
  

  //---------------FILTER-------------------
  // list of checkbox that toggle the marker 
  // in the map based on theri category
  //----------------------------------------
  //toggle filter
  var btn = document.querySelector(".menu_btn.filter");
  btn.addEventListener("click", e => toggle_popup(e.target));

  //create a checkbox per category
  var checkbox_container = document.getElementById("checkbox-container");
  ctg_list.forEach(ctg => {
    //setting the label and the checkbox
    label = document.createElement('label');
    checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.className = "checkbox "+ctg;
    checkbox.name = ctg;
    checkbox.checked = true;
    label.appendChild(checkbox);

    var textNode = document.createTextNode(' ' + ctg);
    label.appendChild(textNode);

    checkbox_container.appendChild(label);
    
    var textNode = document.createElement("span");
    textNode.innerHTML = '<br>';
    checkbox_container.appendChild(textNode);
  })

  //handle event of all the checkbox (toggle the markers by category)
  var checkboxs = [];
  var checkboxs = document.querySelectorAll(".checkbox");
  checkboxs.forEach(c =>{
    c.addEventListener("change", e =>{
      if(e.target.checked){
        var category = e.target.name;
        markers.forEach(m => {
          if(m.getProperties().category == category){
              m.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                  src: './markers/marker_'+category+'.png',
                  scale: 0.3
                })       
              })
            )
          }
        })
      }else{
        var category = e.target.name;
        markers.forEach(m => {
          if(m.getProperties().category == category){
              m.setStyle(new ol.style.Style({}));
          }
        })
      }
    })
  })

  //---------------LIST-------------------
  // list of all the spot divided by category
  // with link to focus on the spot in the map
  //--------------------------------------
  //toggle list
  var btn = document.querySelector(".menu_btn.list");
  btn.addEventListener("click", e => toggle_popup(e.target));

  var category_list_ul = [];
  var category_list_btns = [];
  var list_container = document.getElementById("list-container");

  //exploring the JSON divided by category
  $.each(spot_list_by_ctg, function(i, ctg){
    //foreach category create a button ad a ul
    btn_cat = document.createElement("button");
    btn_cat.className = "button";
    btn_cat.setAttribute('id', i);
    btn_cat.textContent = i;

    category_list_btns.push(btn);

    ul = document.createElement("ul");
    ul.className = "content "+i;
    ul.setAttribute('id', i + '_c')
    ul.style.display = "none";

    category_list_ul.push(ul);
    //fil the ul with all the spots in that category
    $.each(ctg, function(j, spot){
      line = document.createElement("li");
      text = document.createElement("span");
      btn = document.createElement("button");
      text.innerHTML = spot.name;
      btn.setAttribute('class', 'spot_btn');
      btn.setAttribute('id', spot.name + '_' + spot.alt);
      
      //handle the spot button
      btn.addEventListener("click", e => {
        map.getView().setCenter(ol.proj.fromLonLat([
          parseFloat(spot.lng), parseFloat(spot.lat)
        ]))
        map.getView().setZoom(9);
      })

      line.appendChild(text);
      line.appendChild(btn);
      ul.appendChild(line);
    })
    list_container.appendChild(btn_cat);
    category_list_btns.push(btn_cat);
    list_container.appendChild(ul);
  })

  //handle the toggle of the ul when clicked the category button
  category_list_btns.forEach(b => {
    b.addEventListener("click", e => {
      let id_list = e.target.id + '_c';
      const list = document.getElementById(id_list);
      if(list != null){
        if(list.style.display == "none"){
          list.style.display = "block";
          e.target.className = "button_show";
        }
        else {
          list.style.display = "none";
          e.target.className = "button";
        }
      }
    })
  });


  //---------------INFOBOX-------------------
  //toggle infobox
  var btn = document.querySelector(".menu_btn.info");
  btn.addEventListener("click", e => toggle_popup(e.target));

  
  info_content = document.getElementById("info-container");
  
  //set table
  container = document.createElement("table");
  container.className = "info-box-table";

  subtitle_ctg = document.createElement("span");
  subtitle_ctg.innerHTML = "by category";
  subtitle_ctg.style.fontWeight = "bold";
  container.appendChild(subtitle_ctg);

  for(let i=0; i<ctg_list.length; i++){
    row =  document.createElement("tr");
    row.className = "info-box-row";
    ctg = document.createElement("td");
    ctg.className = "info-box-td";
    info = document.createElement("td");

    ctg.innerHTML = ctg_list[i];
    info.innerHTML = ctg_list_counter[i];
    row.appendChild(ctg);
    row.appendChild(info);
    container.appendChild(row);
    
  }
  info_content.appendChild(container);

  line =  document.createElement("hr");
  container.appendChild(line);

  subtitle_country = document.createElement("span");
  subtitle_country.innerHTML = "by country";
  subtitle_country.style.fontWeight = "bold";
  container.appendChild(subtitle_country);

  for(let i=0; i<country_list.length; i++){
    row =  document.createElement("tr");
    row.className = "info-box-row";
    country = document.createElement("td");
    country.className = "info-box-td";
    info = document.createElement("td");

    country.innerHTML = country_list[i];
    info.innerHTML = country_list_counter[i];
    row.appendChild(country);
    row.appendChild(info);
    container.appendChild(row);
    
  }

  info_content.appendChild(container);

  //---------------CENTER-------------------
  // button to focus on a specific part of 
  // wordl, in my case Italy
  //----------------------------------------

  var btn = document.querySelector(".menu_btn.center");
  btn.addEventListener("click", e => {
    //center on italy
    map.getView().setCenter(ol.proj.fromLonLat([
      parseFloat(9), parseFloat(45)
    ]))
    map.getView().setZoom(6);
  })

  //---------------IMAGES GALLERY-------------------
  // gallery with a photo for each spot in the db
  // with link to focus on the spot in the map
  //------------------------------------------------

  //toggle gallery
  var btn = document.querySelector(".menu_btn.gallery");
  btn.addEventListener("click", e => toggle_popup(e.target));
  gallery_content = document.getElementById("gallery-content");

  //get gallery div
  view_btn_grid = document.getElementById("gallery-grid-view");
  view_btn_list = document.getElementById("gallery-list-view");
  
  //add call to the change of the view style
  view_btn_grid.addEventListener('click',e => {grid_view()});
  view_btn_list.addEventListener('click',e => {list_view()});

  //set the default view style
  grid_view();

  //list view
  function list_view(){
    //remove the previous view
    while(gallery_content.firstChild){
      gallery_content.removeChild(gallery_content.firstChild);
    }
    //set table
    container = document.createElement("table");
    container.className = "gallery-list-table";

    //set the row for each spot
    spots.forEach(spot => {
      row =  document.createElement("tr");
      row.className = "gallery-list-row";
      image = document.createElement("td");
      info = document.createElement("td");

      let url = "https://i.imgur.com/" + spot.img + ".jpg";

      //set the image
      image.innerHTML= '<img width=\"150px\" height=\"150px\" src=\"'+ url +'\">';
      image.addEventListener('click', e => {
        map.getView().setCenter(ol.proj.fromLonLat([
          parseFloat(spot.lng-5), parseFloat(spot.lat)
        ]))
        map.getView().setZoom(6);
      })

      //set the info
      info.innerHTML = '<b>'+spot.name+'</b>' + '<br><br>' + 'cat: ' +'<img width=\"20px\" height=\"20px\" src=\"'+ './markers/marker_'+spot.ctg+'.png' +'\">' + '<br>' +
                              'lat: ' + spot.lat.toFixed(2) + ', lon: ' + spot.lng.toFixed(2) + ', alt: ' + spot.alt.toFixed(2);

      row.appendChild(image);
      row.appendChild(info);
      container.appendChild(row);
      
    })
    gallery_content.appendChild(container);
  }

  //grid view
  function grid_view(){
    //remove the previous view
    while(gallery_content.firstChild){
      gallery_content.removeChild(gallery_content.firstChild);
    }
    //declaration of the matrix
    var gallery_grid = [];
    //set the numeber of elements per row
    let num_col = 4;

    //bild the spot matrix
    for(let i=0; i<spots.length/num_col; i++){
      var gallery_row = [];
      for(let j=0; j<num_col; j++){
        var index = i*num_col + j;
        if(index < spots.length)
          gallery_row.push(spots[index]);
      }
      gallery_grid.push(gallery_row);
    }

    gallery_grid.forEach(row => {
      //build the rows
      row_span = document.createElement("span");
      row_span.style.display = "inline-block"
      row_span.style.height = "fit-content";
      row_span.style.verticalAlign = "middle";

      //build the elements
      row.forEach(el => {
        el_btn = document.createElement("button");
        el_btn.className = "gallery_pic";

        let url = "https://i.imgur.com/" + el.img + ".jpg";
        el_btn.style.backgroundImage = "url('"+url+"')";
        el_btn.style.backgroundSize = "cover";
        el_btn.setAttribute('id', el.name + '_' + el.lat);

        info = document.createElement("div");
        name_spot = document.createElement("span");
        icon_spot = document.createElement("span");
        name_spot.innerHTML = el.name + '<br><br>';
        icon_spot.innerHTML= '<img width=\"20px\" height=\"20px\" src=\"'+ './markers/marker_'+el.ctg+'.png' +'\">';
        info.appendChild(name_spot);
        info.appendChild(icon_spot);

        info.className = "gallery_info";
        el_btn.appendChild(info);
        
        el_btn.childNodes[0].style.opacity = 0;
        
        //set the action to center when the image is pressed
        el_btn.addEventListener("click", e => {
          //center on spot
          map.getView().setCenter(ol.proj.fromLonLat([
            parseFloat(el.lng-5), parseFloat(el.lat)
          ]))
          map.getView().setZoom(6);
        })

        //set the overlay when the mouse is over the element
        el_btn.addEventListener('mouseover', e => {
          if(e.target instanceof HTMLButtonElement){
            el_btn.style.backgroundSize = "cover";
            e.target.childNodes[0].style.opacity = 1;
          }
        });

        //delete the overlay when the mouse leaves the element
        el_btn.addEventListener('mouseout', e => {
          if(e.target instanceof HTMLButtonElement){
            e.target.childNodes[0].style.opacity = 0;
          }
        });

        row_span.appendChild(el_btn);
      })
      new_line = document.createElement("br");
      gallery_content.appendChild(new_line);
      gallery_content.appendChild(row_span);
    })
  }
  
}
