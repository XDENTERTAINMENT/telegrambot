//  FETCH


  const user = async()=>{

    try{
        const response = await fetch('https://dummyjson.com/users');

         const result = await response.json();

        console.log(result)

    }

    catch(err){
                console.log(err)
    }
    
  }

  user();



//   post


  const postuser = async(userid)=>{

    try{
        const response = await fetch('https://dummyjson.com/user/login',{
            method:"post",
            header:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                username:userid.username ,
                 password: userid.password,
            }
         )
        });


         const result = await response.json();

        console.log(result);
       

    }

    catch(err){
        console.log(err)
    }
    
  }

  const changed =  postuser({
    userid:{
                username :'peter',
    password: 'peter2',
    expiresInMins: 23,
    }
   
  });
