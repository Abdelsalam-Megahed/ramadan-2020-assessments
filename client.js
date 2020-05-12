document.addEventListener('DOMContentLoaded', function () {
    const formVideoRequest = document.querySelector('#formVideoRequest');
    const listOfVideoRequests = document.querySelector('#listOfRequests');
   

    fetch('http://localhost:7777/video-request')
        .then(response => response.json())
        .then(data => {
            data.forEach((videoRequest) => {
                listOfVideoRequests.appendChild(getSingleVideoRequest(videoRequest));
            })
        });

    formVideoRequest.addEventListener('submit', function(event){
      event.preventDefault();
      const formData = new FormData(this);

      fetch('http://localhost:7777/video-request', {
          method: 'POST',
          body: formData 
      })
      .then((response) => response.json())
      .then((requestVideo) => {
         listOfVideoRequests.prepend(getSingleVideoRequest(requestVideo));
      })
    })
})

function getSingleVideoRequest(videoRequest) {
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
            <a class="btn btn-link">🔺</a>
            <h3>0</h3>
            <a class="btn btn-link">🔻</a>
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

    return videoRequestContainer;
}

    