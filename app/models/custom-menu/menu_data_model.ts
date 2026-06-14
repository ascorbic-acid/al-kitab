import type { MenuItem } from "./menu_item_model";

export interface MenuData {
    items: MenuItem[]
    target: PointerEvent
    openCB?: Function
    closeCB?: Function

}