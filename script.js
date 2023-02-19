'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map, mapEvt;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in minute
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance;
    this.calcPace();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // km/min
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run1 = new Running([34.3818248, 62.1523614], 4, 24, 180);
// const run2 = new Cycling([34.3818248, 62.1523614], 27, 90, 500);
// console.log(run1);
// console.log(run2);

///////////////////////////////
// ! application architencture
class App {
  #map;
  #mapEvt;
  #workouts = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    // change the unit
    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    // using geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    console.log(this.#map);
    // using leaflet API
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling click on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvt = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const { lat, lng } = this.#mapEvt.latlng;
    let workout;

    // if workout running , create running object
    if (type === 'running') {
      const cadance = +inputCadence.value;
      // check if data is valid
      if (
        !validInputs(distance, duration, cadance) ||
        !allPositive(distance, duration, cadance)
      )
        return alert('Inputs have to be positive number');
      workout = new Running([lat, lng], distance, duration, cadance);
    }
    // if workout cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);
    // render workout on map as marker
    this.renderWorkoutMarker(workout);

    // clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    e.preventDefault();
    // display marker
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
