import * as request from 'superagent';


let next = null;
let container = null;
let loadMoreContainer = null;


document.addEventListener('DOMContentLoaded', function(event) {
  container = document.querySelector('.list');
  loadMoreContainer = document.querySelector('.load-more-container');

  let loadMoreButton = document.querySelector('.load-more-button');
  loadMoreButton.addEventListener('click', function(event) {
    event.preventDefault();
    loadMore();
  });

  loadMore();
});


function loadMore() {
  let thisRequest;
  if (next) {
    thisRequest = request.get(next);
  } else {
    thisRequest = request
      .get('http://kudago.com/public-api/v1/events/')
      .query({
        location: 'spb',
        categories: 'theater',
        fields: 'place,description,dates,images,tagline,id,age_restriction,price,title',
        expand: 'place',
      });
  }

  thisRequest
    .set('Accept', 'application/json')
    .end(function(err, res) {
      next = res.body.next;
      if (next) {
        loadMoreContainer.removeAttribute('hidden')
      } else {
        loadMoreContainer.setAttribute('hidden', true);
      }

      let itemList = res.body.results;
      for (let item of itemList) {
        let firstImage = item.images[0].image;
        let li = document.createElement('li');
        li.setAttribute('class', "list-item")
        li.innerHTML = `
          <div class="list-image-container">
            <img src="${firstImage}" class="list-image"/>
          </div>
          <h2>${capfirst(item.title)}</h2>
          <div>${item.place ? capfirst(item.place.title) : ''}</div>`;
        container.appendChild(li);
      }
    });
}

function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
