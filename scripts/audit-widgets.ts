// Deep-dive: catalog Elementor widget types + notable structural patterns
// across EVERY WP page + post, to decide which reusable components to build.
const BASE='https://interventiodev.wpenginepowered.com/wp-json';
const UA={'User-Agent':'Mozilla/5.0 Chrome/120'};
async function all(kind:string){const out:any[]=[];for(let p=1;p<=6;p++){const r=await fetch(`${BASE}/wp/v2/${kind}?per_page=100&page=${p}&status=publish&_fields=slug,content`,{headers:UA});if(!r.ok)break;const d=await r.json();if(!d.length)break;out.push(...d);if(d.length<100)break;}return out;}
async function main(){
  const items=[...await all('pages'),...await all('posts')];
  const widgetPages:Record<string,Set<string>>={};   // widget type -> set of slugs
  const widgetCount:Record<string,number>={};          // widget type -> total occurrences
  const patternPages:Record<string,Set<string>>={};
  const bump=(map:Record<string,Set<string>>,key:string,slug:string)=>{(map[key]??=new Set()).add(slug);};
  for(const it of items){
    const h=it.content.rendered||'';
    for(const m of h.matchAll(/elementor-widget-([a-z0-9-]+)/gi)){
      const w=m[1].toLowerCase();
      widgetCount[w]=(widgetCount[w]||0)+1;
      bump(widgetPages,w,it.slug);
    }
    // structural patterns of interest
    const pats:[string,RegExp][]=[
      ['icon-list-item',/elementor-icon-list-item/i],
      ['icon-box',/elementor-icon-box/i],
      ['two-col (e-con grid/flex >1 child col)',/e-con-boxed|elementor-column-gap/i],
      ['image-widget',/elementor-widget-image\b/i],
      ['button',/elementor-button\b/i],
      ['toggle/accordion',/elementor-(accordion|toggle|tab)/i],
      ['testimonial',/elementor-testimonial/i],
      ['star-rating',/elementor-star-rating/i],
      ['counter',/elementor-counter/i],
      ['divider',/elementor-divider/i],
    ];
    for(const [name,re] of pats) if(re.test(h)) bump(patternPages,name,it.slug);
  }
  console.log(`Analyzed ${items.length} entries\n`);
  console.log('=== Elementor widget types (pages using / total occurrences) ===');
  Object.entries(widgetPages).map(([w,s])=>[w,s.size,widgetCount[w]] as [string,number,number])
    .sort((a,b)=>b[1]-a[1]).forEach(([w,pages,cnt])=>console.log(`  ${w.padEnd(24)} ${String(pages).padStart(3)} pages  ${cnt} occ`));
  console.log('\n=== Notable structural patterns (pages using) ===');
  Object.entries(patternPages).map(([p,s])=>[p,s.size] as [string,number]).sort((a,b)=>b[1]-a[1]).forEach(([p,n])=>console.log(`  ${p.padEnd(38)} ${n}`));
}
main();
