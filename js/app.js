import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import LocomotiveScroll from 'locomotive-scroll';
import Scene from './scene.js';
import Cursor from './cursor';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

const overlay = document.querySelector('.overlay');
const overlayPath = document.querySelector('.overlay__path');
const cursor = new Cursor(document.querySelector('.cursor'));

[...document.querySelectorAll('a')].forEach(link => {
    link.addEventListener('mouseenter', () => cursor.enter());
    link.addEventListener('mouseleave', () => cursor.leave());
});

let loco;

function initScroll() {

    loco = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        getDirection: true
    });

    loco.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy('[data-scroll-container]', {

        scrollTop(value) {
          return arguments.length ? loco.scrollTo(value, 0, 0) : loco.scroll.instance.scroll.y;
        }, 
        getBoundingClientRect() {
            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        },
        pinType: document.querySelector('[data-scroll-container]').style.transform ? "transform" : "fixed"

    });
    ScrollTrigger.addEventListener('refresh', () => loco.update());
    ScrollTrigger.refresh();
}

function theBlob() {

    let blob = new Scene({
        domElement: document.querySelector('#gl-stuff')
    });

    let animMesh = blob.mesh;

    let g1Tl = gsap.timeline({
        clearProps: true,
        scrollTrigger: {
            trigger: '.hello',
            start: "top 60%",
            scroller: ".scroller",
            scrub: 2
        }
    });
    

    g1Tl.to(animMesh.rotation, {
        x: 0.5,
        y: -1
    });

    g1Tl.to(blob.camera.position, {
        x: 3,
        z: 4.5
    }, '-= 1');

    let g2Tl = gsap.timeline({
        clearProps: true,
        scrollTrigger: {
            trigger: '.techno',
            start: "top 80%",
            scroller: ".scroller",
            scrub: 2
        }
    });
    

    g2Tl.to(animMesh.rotation, {
        x: -2.5,
        y: 1.5
    });

    g2Tl.to(animMesh.scale, {
        x: 2.5,
        z: 3
    }, '-= 1');

    // g2Tl.to(blob.camera.scale, {
    //     x: 2.5,
    //     z: 2
    // }, '-= 1');

    g2Tl.to(blob.camera.position, {
        x: 6,
        y: -8
    }, '-= 1');
    
    //console.log(blob);
}

function marQuee() {

    ScrollTrigger.saveStyles(".first, .second");

    ScrollTrigger.matchMedia({
      
      "(max-width: 768px)": function() {
        
        let mobileTL = gsap.timeline({
          scrollTrigger: {
            trigger: ".marquee",
            start: "-100% bottom",
            scrub: 1,
            scroller: ".scroller"
          }
        });

        mobileTL.to(".first", {duration: 2, xPercent: -100})
                .to(".second", {duration: 2, xPercent: 100}, "<");
      },
      
      "(min-width: 769px)": function() {

        let desktopTL = gsap.timeline({
          scrollTrigger: {
            trigger: ".marquee",
            start: "10% bottom",
            scrub: 5,
            scroller: ".scroller"
          }
        });

        desktopTL.to(".first", {duration: 2, xPercent: -100})
                 .to(".second", {duration: 2, xPercent: 100}, "<");
      }
    });

    gsap.to('.techno', {
        backgroundColor: 'rgb(107 255 187)',
        ease: "sine.in",
        duration: 1,
        scrollTrigger: {
            start: "top 70%",
            trigger: ".techno",
            scroller: ".scroller"
        }
    });
}

function home() {

    let textSplit = new SplitText('.text-split', {type: "lines, words"});
    let introSplit = new SplitText('.intro-title', {type: "lines, words"});
    let wavyText = textSplit.words;
    let introText = introSplit.words;
    let workItem = gsap.utils.toArray(".work__item");
    let introTl = gsap.timeline({paused: true, delay: 2.5});

    introText.forEach(word => {

        introTl.from(word, {
            opacity: 0,
            y: 150,
            duration: 0.5,
            delay: 0.2,
            stagger: 0.05,
            ease: "power3"
        })

    });

    introTl.from('#gl-stuff', {
        autoAlpha: 0,
        duration: 2,
        ease: 'power3.out'
    });

    wavyText.forEach(word => {

        gsap.from(word, {
            opacity: 0,
            y: 150,
            stagger: 0.5,
            ease: "power3inOut",
            scrollTrigger: {
                trigger: word,
                start: "top 70%",
                scroller: ".scroller",
            }
        })
    });


    workItem.forEach(item => {

        let line = item.querySelectorAll('.line');
        let client = item.querySelectorAll('.work__item a');
        let workSplit = new SplitText(client, {type: "lines, words"});
        let workText = workSplit.lines;
        let workTl = gsap.timeline({
            clearProps: true,
            stagger: 0.5,
            ease: "power3inOut",
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
                scroller: ".scroller"
            }
        });

        workTl.to(line, {
            scaleX: 1.0,
            duration: 1.0
        })

        workTl.from(workText, {
            opacity: 0,
            y: 150
        }, '-= 0.5')
    });

    theBlob();

    marQuee();

    introTl.play();
}


function pageTransitionIn({container}) {
    return gsap.timeline()
        .set(overlayPath, { 
            attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.3,
            ease: 'power2.in',
            attr: { d: 'M 0 100 V 50 Q 50 100 100 50 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.8,
            ease: 'power4',
            attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
        })
        .to(overlayPath, {
            autoAlpha: 0,
            ease: 'power4'
        })
        .from(container, {
            opacity: 0
        })
}

function pageTransitionOut({container}) {
    return gsap.timeline()
        .to(container, {
            opacity: 0,
            duration: 0.5
        })
        .set(overlayPath, {
            attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' }
        })
        .to(overlayPath, { 
            duration: 0.8,
            ease: 'power4.in',
            attr: { d: 'M 0 0 V 50 Q 50 100 100 50 V 0 z' }
        }, 0)
        .to(overlayPath, { 
            duration: 0.3,
            ease: 'power2',
            attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' }
        })
}



window.addEventListener("load", () => {
    initScroll();
    home();
});

document.addEventListener("DOMContentLoaded", () => {

    gsap.timeline({delay: 0.5})
        .set(overlayPath, { 
            attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.3,
            ease: 'power2.in',
            attr: { d: 'M 0 100 V 50 Q 50 100 100 50 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.8,
            ease: 'power4',
            attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
        })
        .to(overlay, {
            autoAlpha: 0,
            ease: 'power4'
        })
        .to('#gl-stuff, .scroller', {
            autoAlpha: 1,
            duration: 2.0,
            ease: "power3inOut"
        })
        
});
