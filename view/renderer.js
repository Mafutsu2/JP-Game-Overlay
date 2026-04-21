window.electronAPI.onUpdateWindows((allWindows) => {
  let options = document.getElementById('window-options');
  options.innerHTML = '';
  allWindows = [ { id: -1, title: '--None--', owner: '--None--' }, ...allWindows ];
  allWindows.forEach(w => {
    const div = document.createElement('div');
    div.className = 'px-5 py-1 rounded text-sm cursor-pointer hover:bg-[#423a83]';
    div.addEventListener('click', (event) => {
      selectedWindow = w;
      document.getElementById('window').innerText = w.title;
      document.getElementById('fake-height').innerText = w.title;
    });
    const divApp = document.createElement('div');
    divApp.className = 'pb-1 text-xs opacity-70';
    divApp.innerText = w.owner;
    div.appendChild(divApp);
    const divWindow = document.createElement('div');
    divWindow.innerText = w.title;
    div.appendChild(divWindow);

    options.appendChild(div);
  });
});

window.electronAPI.onUpdateText((json) => {
  document.getElementById('container').innerHTML = '';
  for (let i = 0; i < json.length; i++) {
    for (let j = 0; j < json[i].chars.length; j++) {
      const width = json[i].chars[j].bbox[2] - json[i].chars[j].bbox[0];
      const height = json[i].chars[j].bbox[3] - json[i].chars[j].bbox[1];
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = json[i].chars[j].bbox[0] + 'px';
      div.style.top = json[i].chars[j].bbox[1] + 'px';
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      div.style.cursor = 'default';
      div.style.fontSize = (width > height ? width : height) + 'px';
      div.style.opacity = 0;
      div.innerText = paddToCenterChar(j, json[i].text);
      document.getElementById('container').appendChild(div);
    }
  }
});

window.electronAPI.onStateChanged((isVisible) => {
  document.getElementsByTagName('body')[0].style.backgroundColor = isVisible ? '#FFFFFF22' : '#FFFFFF00';
});

const paddToCenterChar = (position, text) => {
  let newText = text;
  let newPosition = position;
  let half = parseInt(newText.length / 2);
  while (newPosition !== half || newText.length % 2 === 0) {
    if (newPosition < half) {
      newText = '.' + newText;
      newPosition++;
    } else
      newText = newText + '.';

    half = parseInt(newText.length / 2);
  }
  return newText;
};
