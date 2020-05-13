const listOfVideoRequests = document.querySelector('#listOfRequests');
const formVideoRequest = document.querySelector('#formVideoRequest');
let sortBy = 'newFirst';
let searchTerm = '';

function loadAllVideoRequests(sortBy = 'newFirst', searchTerm = ''){
    fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        data.forEach((videoRequest) => {
            renderSingleVideoRequest(videoRequest);
        })
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const sortByElements = document.querySelectorAll('[id*=sort_by_]');
    const searchBox = document.querySelector('#search-box');
//GET
    loadAllVideoRequests();

//Search   
    searchBox.addEventListener('input', debounce((event) => {
        console.log(event.target.value);
        searchTerm = event.target.value;
        listOfVideoRequests.innerHTML='';
        loadAllVideoRequests(sortBy, searchTerm);
    },1000)
   );

//SortBY
    sortByElements.forEach(element => {
        element.addEventListener('click', function(event){
            event.preventDefault();

            sortBy = this.querySelector('input').value;
            listOfVideoRequests.innerHTML='';
            loadAllVideoRequests(sortBy, searchTerm);

            if(sortBy === 'topVotedFrst'){
                document.getElementById('sort_by_top').classList.add('active');
                document.getElementById('sort_by_new').classList.remove('active');
            }else{
                document.getElementById('sort_by_top').classList.remove('active');
                document.getElementById('sort_by_new').classList.add('active');
            }
        })
    })

//POST
    formVideoRequest.addEventListener('submit', function(event){
      event.preventDefault();
      const formData = new FormData(this);
      const isValid = checkValidity(formData);
      if(!isValid) return;

      fetch('http://localhost:7777/video-request', {
          method: 'POST',
          body: formData 
      })
      .then((response) => response.json())
      .then((videoRequest) => {
         renderSingleVideoRequest(videoRequest, true);
      })
    })
})
////////////////////////////////////////////
function checkValidity(formData){
    const author_name = formData.get('author_name');
    const author_email = formData.get('author_email');
    const topic_title = formData.get('topic_title');
    const topic_details = formData.get('topic_details');
      
    if(!author_name){
        document.querySelector('[name=author_name]').classList.add('is-invalid');          
      }
      const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(!author_email || !emailPattern.test(author_email)){
        document.querySelector('[name=author_email]').classList.add('is-invalid');          
      }
      if(!topic_title || topic_title.length > 40){
        document.querySelector('[name=topic_title]').classList.add('is-invalid');          
      }
      if(!topic_details){
        document.querySelector('[name=topic_details]').classList.add('is-invalid');          
      }

    const invalidElements = formVideoRequest.querySelectorAll('.is-invalid');
    if(invalidElements.length){
        invalidElements.forEach((element) => {            
            element.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            });
        });
        
        return false;
    }
    return true;
}

function debounce(fun, delay){
    let timeout;

    return function(...args){
        clearTimeout(timeout);
        timeout = setTimeout(() => fun.apply(this, args), delay);
    }
}

function renderSingleVideoRequest(videoRequest, isAppend = false) {
    const videoRequestContainer = document.createElement('div');
    videoRequestContainer.innerHTML = `
        <div class="card mb-3">
        <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
            <h3>${videoRequest.topic_title}</h3>
            <p class="text-muted mb-2">${videoRequest.topic_details}</p>
            <p class="mb-0 text-muted">
          ${
              videoRequest.expected_result &&  
              `<strong>Expected results:</strong> ${videoRequest.expected_result}` 
            }
            </p>
        </div>
        <div class="d-flex flex-column text-center">
            <a id="votes_ups_${videoRequest._id}" class="btn btn-link">🔺</a>
            <h3 id="score_vote_${videoRequest._id}">${videoRequest.votes.ups - videoRequest.votes.downs}</h3>
            <a id="votes_downs_${videoRequest._id}" class="btn btn-link">🔻</a>
        </div>
        </div>
        <div class="card-footer d-flex flex-row justify-content-between">
        <div>
            <span class="text-info">${videoRequest.status.toUpperCase()}</span>
            &bullet; added by <strong>${videoRequest.author_name}</strong> on
            <strong>${new Date(videoRequest.submit_date).toLocaleDateString()}</strong>
        </div>
        <div
            class="d-flex justify-content-center flex-column 408ml-auto mr-2"
        >
            <div class="badge badge-success">
            ${videoRequest.target_level}
            </div>
        </div>
        </div>
        </div>
    `;

    if(!isAppend){
        listOfVideoRequests.appendChild(videoRequestContainer);
    }else{
        listOfVideoRequests.prepend(videoRequestContainer);
    }

    const voteUpElement = document.querySelector(`#votes_ups_${videoRequest._id}`);
    const voteDownElement = document.querySelector(`#votes_downs_${videoRequest._id}`);
    const scoreVote = document.querySelector(`#score_vote_${videoRequest._id}`);

    voteUpElement.addEventListener('click', (event) => {
        console.log(event);
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({id: videoRequest._id, vote_type: 'ups'})
        })
        .then(res => res.json())
        .then(data => scoreVote.innerHTML = data.ups - data.downs);
    });

    voteDownElement.addEventListener('click', (event) => {
        console.log(event);
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({id: videoRequest._id, vote_type: 'downs'})
        })
        .then(res => res.json())
        .then(data=> scoreVote.innerHTML = data.ups - data.downs);
    });
}

    