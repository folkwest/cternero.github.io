window.addEventListener('scroll', () => {
  document.body.style.setProperty('--scroll',window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
}, false);

function darkMode() {
  var element = document.body;
  element.classList.toggle("dark-mode");

}
