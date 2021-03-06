
        class Continent {
            constructor(name, countries = []) {
                this.name = name;
                this.countries = countries;
            }
    }

        class Country {
            constructor(name, code) {
                this.name = name;
                this.code = code;
            }

            // 1. confirmed 2. deaths 3. recovered 4.critical 5. total cases (the same as 1?), 6.new cases 7.total deaths(same as 2?) 8.new deaths 9.total recovered(same as 3?) 10.in critical condition(same as 4?)
            setCovidInfo (confirmed, deaths, recovered, critical, totalCases, newCases, totalDeaths, newDeaths, totalRecovered) {
                this.confirmed = confirmed;
                this.deaths = deaths;
                this.recovered = recovered;
                this.critical = critical;
                this.totalCases = totalCases;
                this.newCases = newCases;
                this.totalDeaths = totalDeaths;
                this.newDeaths = newDeaths;
                this.totalRecovered = totalRecovered;
            }
        }

        const countriesAPI = 'https://restcountries.herokuapp.com/api/v1';
        const proxy = 'https://api.codetabs.com/v1/proxy/?quest';
        const covidAPI = 'https://corona-api.com/countries';


        async function fetchAndJson(url) {
            let data = await fetch(url);
            return data.json();
        }

        (async () => {
            // create an array of continents objects, each holds a countries array
            const continents = await createContinentArr();
            let chosenCont;
            console.log(continents);
            // create information of continent: each state holds: 1. confirmed 2. deaths 3. recovered 4.critical 5. total cases (the same as 1?), 6.new cases 7.total deaths(same as 2?) 8.new deaths 9.total recovered(same as 3?) 10.in critical condition(same as 4?)
            await createCovidData(continents);
            continents.map(cont => {
                cont.countries.map(cou => {
                    console.log(cou)
                })
            })

            // add btns for the continents
            addContinentsBtns(continents);

            // add events listeners
            document.querySelector('.continents-btns').addEventListener('click', continentHandler);
            document.querySelector('.which-data-btns').addEventListener('click', whichDataHandler);
            //document.querySelector('.country-btns').addEventListener('click',countryHandler); 
        })()
        
        async function createContinentArr() {
            const countryData = await fetchAndJson(`${proxy}=${countriesAPI}`);
            return continents = countryData.reduce(fromAPIToContinentsArr, []);
        }

        function fromAPIToContinentsArr(continentsArr, country) {
            // if continent exist in the array
            const continentI = continentsArr.findIndex((value) => value.name === country.region);
            if (continentI != -1) {
                continentsArr[continentI].countries.push(new Country(country.name.common, country.cca2));
            } else { // if we should build the continent obj
                // build new continent, with the country obj in its array of countries
                continentsArr.push(new Continent(country.region, [new Country(country.name.common, country.cca2)]));
            }
            
            return continentsArr;
        }

        async function createCovidData(continents) {
            const covidData = await fetchAndJson(covidAPI);
            console.log(covidData);
            continents.forEach(cont => {
                if (cont)
                cont.countries.forEach(country => {
                    // get the covid info for this country
                    let countryData;
                    let i = 0;
                    while (!countryData && i < covidData.data.length) {
                        if (country.code === covidData.data[i].code){
                            countryData = covidData.data[i];
                            country.setCovidInfo(countryData.latest_data.confirmed, countryData.latest_data.deaths, countryData.latest_data.recovered, countryData.latest_data.critical, countryData.latest_data.deaths + countryData.latest_data.confirmed + countryData.latest_data.recovered, countryData.today.confirmed, countryData.latest_data.deaths, countryData.today.deaths, countryData.latest_data.recovered);
                        }

                        i++;
                    }
                    
                })
            })
        }

        function addContinentsBtns(continents) {
            const contDiv = document.querySelector('.continents-btns');
            continents.forEach(continent => {
                // if there is a name of continent
                if (continent.name != '') {
                    const btn = document.createElement('button')
                    btn.innerText = `${continent.name}`;
                    btn.classList.add('continent-btn');
                    contDiv.appendChild(btn);
                }
            });
        }

        function createContinentChart(cont, whichData) {
            // destroy the old chart
            let ctx = document.querySelector('.graph');
            ctx.innerHTML = '';
            ctx.innerHTML = `<canvas id="myChart" width="400" height="400"></canvas>`;
            ctx = ctx.firstElementChild;

            let myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: cont.countries.map(countryData => countryData.name),
                    datasets: [{
                        label: '# of Votes',
                        data: cont.countries.map(countryData => countryData[whichData]),
                        backgroundColor: [
                            'rgba(0, 99, 132, 0.2)',
                            'rgba(0, 0, 0, 0.2)',
                            'rgba(255, 255, 255, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        function continentHandler() {
            // check which continent was clicked
            chosenCont = continents.find(cont => cont.name === (event.target.innerText));
            // display the continent info - (confirmed/deaths/recovered/critical)
            createContinentChart(chosenCont, 'confirmed');
            // display the cases buttons
            document.querySelector('.which-data-btns').style = 'display: inline-block;'
            // remove old btns
            const countriesBtns = document.querySelector('.countries-btns');
            countriesBtns.innerText = '';
            // add buttons for the countries of the continent
            chosenCont.countries.forEach(country => {
                const countryBtn = document.createElement('button');
                countryBtn.classList.add('case-btn');
                countryBtn.innerText = country.name;
                countriesBtns.appendChild(countryBtn);
            });
        }

        function whichDataHandler() {
            // display the graph with the case that was clicked
            let chosenCase;
            switch (event.target.innerText) {
                case 'Confirmed Cases':
                    chosenCase = 'confirmed';
                    break;

                case 'Number of Deaths':
                    chosenCase = 'deaths';
                    break;

                case 'Number of Recovered':
                    chosenCase = 'recovered';
                    break;

                case 'Number of Critical Condition':
                    chosenCase = 'critical';
                    break;
            
                default:
                    break;
            }

            createContinentChart(chosenCont, chosenCase);
        }

        function countryHandler() {
            
        }

        
    