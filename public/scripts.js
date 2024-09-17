document.getElementById('start-meeting').addEventListener('click', async (event) => {
    event.preventDefault();

    fetch('/getComponents')
    .then(res => res.json())
    .then(data => {
        
        let feedbackText = document.getElementById('feedback');
        let str = "";

        data.forEach(comp => {
            str = `${str}\n${comp.ID}\n`;
            let item = document.createElement('input');
            item.innerHTML = `<h4>${str}</h4>`;
        });

        const item = document.createElement('div');
        item.innerHTML = `<h4>${str}</h4>`;
        console.log(item.innerHTML);
        feedbackText.appendChild(item);
    })
});

document.addEventListener('DOMContentLoaded', () => {
//   const volumeButton = document.getElementById('volume-control');
//   const volumeSlider = document.getElementById('volume-slider');
//   volumeSlider.className = "hidden";
//   const volumeRange = document.getElementById('volume-range');
//   const volumeValue = document.getElementById('volume-value');

  const nvx1 = document.getElementById('nvx-1');
  const nvx2 = document.getElementById('nvx-2');

  nvx1.addEventListener('click', async () => {
    nvx1.disabled = true;
    fetch('/nvx1');
    nvx1.disabled = false;
  });

  nvx2.addEventListener('click', () => {
    nvx2.disabled = true;
    fetch('/nvx2');
    nvx2.disabled = false;
  });
//   volumeButton.addEventListener('click', () => {
//       console.log('clicked');
//       volumeButton.classList.toggle('active');
//   });

//   volumeRange.addEventListener('input', () => {
//       const value = volumeSlider.value;
//       volumeValue.textContent = value;

//       // Send the volume value to the server
//       fetch('/setVolume', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ volume: value }),
//       })
//       .then(response => response.json())
//       .then(data => {
//           console.log('Volume set successfully:', data);
//       })
//       .catch(error => {
//           console.error('Error setting volume:', error);
//       });
//   });

});


// document.getElementById('stop-meeting').addEventListener('click', async (event) => {
//   console.log(event);
//   // event.preventDefault();
//   // fetch('/getControl')
//   //     .then((res => res.json))
// });

