import * as request from 'superagent';


document.addEventListener('DOMContentLoaded', function(event) {

  let container = document.querySelector('#list');

  request
    .get('http://kudago.com/public-api/v1/events/')
    .query({
      location: 'spb',
      categories: 'theater',
      fields: 'place,description,dates,images,tagline,id,age_restriction,price,title',
      expand: 'place',
    })
    .set('Accept', 'application/json')
    .end(function(err, res) {
      let itemList = res.body.results;
      for (let item of itemList) {
        let firstImage = item.images[0].image;
        let li = document.createElement('li');
        li.setAttribute('class', "list-item")
        li.innerHTML = `
          <img src="${firstImage}" class="list-image"/>
          <h2>${capfirst(item.title)}</h2>
          <div>${capfirst(item.place.title)}</div>`;
        container.appendChild(li);
      }
    })

});


function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
