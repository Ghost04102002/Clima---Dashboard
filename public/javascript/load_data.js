import {tiempoArr, precipitacionArr, uvArr, temperaturaArr} from './static_data.js';
let fechaActual = () => new Date().toISOString().slice(0,10);
let cargarPrecipitacion = () => {

    //Obtenga la función fechaActual
    let actual = fechaActual();
    //Defina un arreglo temporal vacío
    let datos = []
    //Itere en el arreglo tiempoArr para filtrar los valores de precipitacionArr que sean igual con la fecha actual
    for (let index = 0; index < tiempoArr.length; index++) {
        const tiempo = tiempoArr[index];
        const precipitacion = precipitacionArr[index]
    
        if(tiempo.includes(actual)) {
          datos.push(precipitacion)
        }
    }
    //Con los valores filtrados, obtenga los valores máximo, promedio y mínimo
    let max = Math.max(...datos)
    let min = Math.min(...datos)
    let sum = datos.reduce((a, b) => a + b, 0);
    let prom = (sum / datos.length) || 0;
    //Obtenga la referencia a los elementos HTML con id precipitacionMinValue, precipitacionPromValue y precipitacionMaxValue
    let precipitacionMinValue = document.getElementById("precipitacionMinValue")
    let precipitacionPromValue = document.getElementById("precipitacionPromValue")
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue")
    //Actualice los elementos HTML con los valores correspondientes
    precipitacionMinValue.textContent = `Min ${min} [mm]`
    precipitacionPromValue.textContent = `Prom ${ Math.round(prom * 100) / 100 } [mm]`
    precipitacionMaxValue.textContent = `Max ${max} [mm]` 
  }
cargarPrecipitacion()

let cargarFechaActual = () => {
  
    //Obtenga la referencia al elemento h6
    let coleccionHTML = document.getElementsByTagName("h6")
    let tituloH6 = coleccionHTML[0]
    //Actualice la referencia al elemento h6 con el valor de la función fechaActual()
    tituloH6.textContent = fechaActual()
  }
cargarFechaActual()

let cargarOpenMeteo = () => {

    //URL que responde con la respuesta a cargar
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto';  
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        //Respuesta en formato JSON
        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot1');
        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;
        //Etiquetas de los datos
        let data = responseJSON.hourly.temperature_2m;
        //Objeto de configuración del gráfico
        let config = {
         type: 'line',
          data: {
           labels: labels, 
           datasets: [
            {
             label: 'Temperature [2m]',
             data: data, 
            }
           ]
          }
         };
         //Objeto con la instanciación del gráfico
         let chart1  = new Chart(plotRef, config);
         console.log(responseJSON);       
        //Respuesta en formato JSON
      })
      .catch(console.error);
  
  }
cargarOpenMeteo()

let cargarOpenMeteo2 = () => {

  //URL que responde con la respuesta a cargar
  let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=precipitation_probability,weathercode&timezone=auto';  
  fetch( URL )
    .then(responseText => responseText.json())
    .then(responseJSON => {
      //Respuesta en formato JSON
      //Referencia al elemento con el identificador plot
      let plotRef = document.getElementById("plot2");
      //Etiquetas del gráfico
      let labels = responseJSON.hourly.time;
      //Etiquetas de los datos
      let data = responseJSON.hourly.precipitation_probability;
      let data2 = responseJSON.hourly.weathercode;

      //Objeto de configuración del gráfico
      let config = {
       type: 'line',
        data: {
         labels: labels, 
         datasets: [
          {
           label: 'precipitation_probability',
           data: data, 
          },
          {
            label: "weathercode",
            data: data2,
          }
         ]
        }
       };
       //Objeto con la instanciación del gráfico
       let chart1  = new Chart(plotRef, config);
       console.log(responseJSON);       
      //Respuesta en formato JSON
    })
    .catch(console.error);

}
cargarOpenMeteo2()

let parseXML = (responseText) => {
  
  // Parsing XML
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");

   // Referencia al elemento `#forecastbody` del documento HTML

   let forecastElement = document.querySelector("#forecastbody")
   forecastElement.innerHTML = ''

   // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
   let timeArr = xml.querySelectorAll("time")

   timeArr.forEach(time => {
       
       let from = time.getAttribute("from").replace("T", " ")

       let humidity = time.querySelector("humidity").getAttribute("value")
       let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
       let precipitation = time.querySelector("precipitation").getAttribute("probability")
       let pressure = time.querySelector("pressure").getAttribute("value")
       let cloud = time.querySelector("clouds").getAttribute("all")

       let template = `
           <tr>
               <td>${from}</td>
               <td>${humidity}</td>
               <td>${windSpeed}</td>
               <td>${precipitation}</td>
               <td>${pressure}</td>
               <td>${cloud}</td>
           </tr>
       `

       //Renderizando la plantilla en el elemento HTML
       forecastElement.innerHTML += template;
   })

  console.log(xml)

}

//Callback
let selectListener = async (event) => {

  let selectedCity = event.target.value
  // Lea la entrada de almacenamiento local
  let cityStorage = localStorage.getItem(selectedCity);

  if (cityStorage == null) {
  
      try {
        //API key
        let APIkey = '6b4f78c6e188cc77cf765ed8f15a7cb9'
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`

        let response = await fetch(url)
        let responseText = await response.text()
        
        await parseXML(responseText) 
        // Guarde la entrada de almacenamiento local
        await localStorage.setItem(selectedCity, responseText)

      } catch (error) {
        console.log(error)
         
      }

  } else {
      // Procese un valor previo
      parseXML(cityStorage)
  }
  console.log(selectedCity);

}

let loadForecastByCity = () => {

  //Handling event
  let selectElement = document.querySelector("select")
  selectElement.addEventListener("change", selectListener)

}

loadForecastByCity()
 
let loadExternalTable = async () => {
  
 //Requerimiento asíncrono
 try {
  let proxyURL = 'https://cors-anywhere.herokuapp.com/'
  let endpoint = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
  
  let response = await fetch(endpoint)
  let responseText = await response.text()
  // Parsing XML
  const parser = new DOMParser();
  const xmldoc = parser.parseFromString(responseText, "text/html");
   // Referencia al elemento `#forecastbody` del documento HTML

   let elementoXML = xmldoc.querySelector("#postcontent table");

   localStorage.setItem('storedTable', elementoXML.outerHTML);
   
   let elementoDOM = document.getElementById("monitoreo");
   elementoDOM.innerHTML = elementoXML.outerHTML;  
  
  } catch (error) {
    console.log(error)
    
  }

}

loadExternalTable()  

// Function to load the table from local storage and update the DOM
function loadTableFromLocalStorage() {
  let storedTable = localStorage.getItem('storedTable');
  if (storedTable) {
    let elementoDOM = document.getElementById("monitoreo");
    elementoDOM.innerHTML = storedTable;
  }
}

// Call the function during page load
document.addEventListener('DOMContentLoaded', loadTableFromLocalStorage);