


class School{
    schoolId = 1;
    name = "";
  }
  const ul = document.getElementById("schoolList-list");
  const loading = document.getElementById("schoolList-loading");
  const main = document.getElementById("schools");
  const input = document.getElementById("schoolList-input");
  let schools: School[] = [];
  async function loadSchools(){
      let res = await fetch("/backend/school/listAll/");
      schools = await res.json();
      render(schools);
  }
  
  function render(schools: School[]){
      if(ul !== null && loading !== null && main !== null){
          ul.innerHTML = "";
          schools.forEach(school => {
              let li = document.createElement("li");
              li.innerText = school.name;
              ul.appendChild(li);
          });
          main.style.display = "block";
          loading.style.display = "none";
      }else{
          console.error("loading or list not found");
      }
  }
  
  if(input !== null){
      input.addEventListener("keyup", event=>{
          if(event.target != null && "value" in event.target){
              const target = event.target as HTMLInputElement;
              let schoolsLocal = schools.filter(school =>{
                  return school.name.toUpperCase().includes(target.value.toUpperCase());
              });
              render(schoolsLocal);
          }
      });
  }
  
  loadSchools();