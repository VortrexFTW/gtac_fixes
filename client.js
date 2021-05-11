"use strict";
setErrorMode(RESOURCEERRORMODE_STRICT);


// Adds the following events:

// OnPedEnteredVehicle (Ped ped, Vehicle vehicle, Integer seat)
// OnPedExitedVehicle (Ped ped, Vehicle vehicle, Integer seat)
// OnPedEnteringVehicle (Ped ped, Vehicle vehicle, Integer seat)
// OnPedExitingVehicle (Ped ped, Vehicle vehicle, Integer seat)
// OnPedJackVehicle (Ped ped, Vehicle vehicle, Integer seat, Ped jackedPed)
// OnPedSwitchWeapon (Ped ped, Integer oldWeapon, Integer newWeapon)
// OnPedMoneyChange (Ped ped, Integer oldMoney, Integer newMoney)

// OnEntityEnteredSphere (Entity entity, Marker sphere)
// OnEntityExitedSphere (Entity entity, Marker sphere)

// OnVehicleStartBurning (Vehicle vehicle)
// OnVehicleStopBurning (Vehicle vehicle)


// ---------------------------------------------------------------------------

bindEventHandler("OnResourceStart", (event, resource) => {
    addEvent("OnPedEnteredVehicle", 3);
    addEvent("OnPedExitedVehicle", 3);

    addEvent("OnPedEnteringVehicle", 3);
    addEvent("OnPedExitingVehicle", 3);

    addEvent("OnPedJackVehicle", 3);
    addEvent("OnPedSwitchWeapon", 3);
    addEvent("OnPedMoneyChange", 3);

    addEvent("OnEntityEnteredSphere", 2);
    addEvent("OnEntityExitSphere", 2);

    addEvent("OnVehicleStartBurning", 1);
    addEvent("OnVehicleStopBurning", 1);
});

// ---------------------------------------------------------------------------

addEventHandler("OnEntityProcess", (event, entity) => {
    if(entity == null) {
        return false;
    }

    if(entity.isType(ELEMENT_PLAYER) || entity.isType(ELEMENT_PED)) {
        if(entity.vehicle) {
            if(!entity.getData("vehicle")) {
                entity.setData("vehicle", entity.vehicle);
                entity.setData("seat", getPedVehicleSeat());
                triggerEvent("OnPedEnteredVehicle", entity, entity, entity.getData("vehicle"), entity.getData("seat"));
                if(entity.getData("jacking")) {
                    triggerEvent("OnPedJackVehicle", entity, entity, entity.getData("vehicle"), entity.getData("seat"), entity.getData("jacking"));
                    entity.removeData("jacking");
                }
            }
        } else {
            if(entity.getData("vehicle")) {
                triggerEvent("OnPedExitedVehicle", entity, entity, entity.getData("vehicle"), entity.getData("seat"));
                entity.removeData("vehicle");
                entity.removeData("seat");
            }
        }

        getElementsByType(ELEMENT_MARKER).forEach((sphere) => {
            if(position.distance(sphere.position) <= sphere.radius) {
                if(!entity.getData("sphere")) {
                    entity.getData("sphere", sphere);
                    triggerEvent("OnPedEnterSphere", entity, entity, sphere);
                }
            } else {
                if(entity.getData("sphere")) {
                    entity.removeData("sphere");
                    triggerEvent("OnPedExitSphere", entity, entity, sphere);
                }
            }
        });

        if(entity.weapon != 0) {
            if(!entity.getData("weapon") || entity.getData("weapon") != entity.weapon) {
                triggerEvent("OnPedSwitchWeapon", entity, entity, entity.weapon, entity.getData("weapon"));
                entity.setData("weapon", entity.weapon);
            }
        } else {
            if(entity.getData("weapon")) {
                triggerEvent("OnPedSwitchWeapon", entity, entity, entity.getData("weapon"), entity.weapon);
                entity.removeData("weapon", entity.weapon);
            }
        }

        if(entity.getData("money")) {
            if(entity.money !== entity.getData("money")) {
                triggerEvent("OnPedMoneyChange", entity, entity, entity.getData("money"), entity.money);
            }
        }
    } else if(entity.isType(ELEMENT_VEHICLE)) {
        if(gta.game <= GAME_GTA_IV) {
            if(entity.health <= 250) {
                if(!entity.getData("burning")) {
                    triggerEvent("OnVehicleStartBurning", entity, entity);
                    entity.setData("burning", true);
                }
            } else {
                if(entity.getData("burning")) {
                    triggerEvent("OnVehicleStopBurning", entity, entity);
                    entity.removeData("burning");
                }
            }
        }
    }
});

// ---------------------------------------------------------------------------

addEventHandler("OnProcess", function(event, deltaTime) {
    if(removeDefaultPickups) {
        getElementsByType(ELEMENT_PICKUP).forEach((pickup) => {
            if(pickup.isOwner && pickup.resource == null) {
                destroyElement(pickup);
            }
        });
    }
});

// ---------------------------------------------------------------------------

function getPedVehicleSeat(ped) {
    for(let i = 0 ; i <= 8 ; i++) {
        if(ped.vehicle.getOccupant(i) == ped) {
            return i;
        }
    }
}

// ---------------------------------------------------------------------------

addEventHandler("OnPedExitVehicle", (event, ped, vehicle) => {
    triggerEvent("OnPedExitingVehicle", null, ped, vehicle);
});

// ---------------------------------------------------------------------------

addEventHandler("OnPedEnterVehicle", (event, ped, vehicle) => {
    triggerEvent("OnPedEnteringVehicle", null, ped, vehicle);
    if(vehicle.getOccupant(0) != null) {
        ped.setData("jacking", vehicle.getOccupant(0));
    }
});

// ---------------------------------------------------------------------------