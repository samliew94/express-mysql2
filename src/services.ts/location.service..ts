export  function allMrtLocations() {

    let arr:string[] = []
    for (let i = 1; i <= 100; i++) {
        const mrtName = "MRT-".padStart(3, "0");
        arr.push(mrtName)
    }

    return arr
    
}