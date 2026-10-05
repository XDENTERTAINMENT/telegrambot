

// const fetch = async ()=>{

// };

async function names(params) {
    
//  fetch("")
//  .then(res => res)
//  .then(data)
try {
  const res =  await fetch(params);
  console.log(res)
}
catch(err){
  console.log(err)
}

}

 const  user =  await names({age:30})
