
gsap.registerPlugin(ScrollTrigger); 
// function scrollRightFunc(){
//     document.querySelector(".topdestin")
//     .scrollBy({
//         left: 1000,
//         behavior: "smooth"
//     });
// }
// const video = document.querySelector(".bg-video");

// video.playbackRate = 0.25;

// function updateDate(inputId, labelId) {
//     const input = document.getElementById(inputId);
//      const [year, month, day] = input.value.split('-');
//     const date = new Date(year, month - 1, day);
//     const formatted = date.toLocaleDateString('en-GB', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//     });
//     document.getElementById(labelId).innerText = formatted;
// }
const contactLink = document.querySelector('a[href="#contact"]');
if (contactLink) {
    contactLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.getElementById('contact');
        const targetPos = target.getBoundingClientRect().top + window.scrollY;
        const startPos = window.scrollY;
        const distance = targetPos - startPos;
        const duration = 1500;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            window.scrollTo(0, startPos + distance * ease);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    });
}
const loginbtn=document.querySelector(".rn:last-child");

const t1=gsap.timeline();

t1.from(".leftnav",{
    y:-30,
    opacity:0,
   
    duration:0.5,
    
    
})
t1.from(".rn",{
     y:-30,
    opacity:0,
    duration:0.5,
    stagger:0.2
})
gsap.to("#page2",{
    backgroundColor:"black",
    scrollTrigger:{
        trigger:"#page2",
        scroller:"body",
        start:"top 80%",
        end:"top 20%",
        scrub:2
    }
})
// t1.from(".heading",{
//     y:-20,
//     opacity:0,
//     duration:1
// })
// gsap.to(".heading",{
//     y:200,
//     x:450,
//     duration:3,
//     // delay:3,
//     scrollTrigger:{
//     trigger:"#page1",
//    scroller: "body",
//         start: "top top",
//         end: "+=300",
//         scrub: 1,
//         pin:true
       
//     }
// })
const t2=gsap.timeline();
t2.to(".login",{
    right:0,
    duration:0.8
})

