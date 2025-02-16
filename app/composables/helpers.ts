
// get ayah number from html target attribute 
export function useGetAyahNrFromTarget(target?: HTMLElement): number {
  console.log(target);
  
  return Number(target!.getAttribute("kbt-ayah-nr"))
}