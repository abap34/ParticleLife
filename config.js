// 力の設計方針:
// 大体距離くらいのオーダーにして全体を係数で調整する

// これよりも遠い距離の粒子間は力を及ぼさないようにする
const maxDistance = 100;


// 同種の粒子間が全く同じ位置にならないよう、反発し始める距離
const replusionDistances = {
    0: 10,
    1: 20,
    2: 30,
    3: 40,
    4: 50,
};

// 同種の粒子間の反発力
const replusionForce = {
    0: (d) => -10 / d,
    1: (d) => -4 / d,
    2: (d) => -6 / d,
    3: (d) => -8 / d,
    4: (d) => -10 / d,
}


function computeForce(typeI, typeJ, d) {
    if (d > maxDistance) {
        return 0;
    }

    if (typeI == typeJ) {
        if (d < replusionDistances[typeI]) {
            return replusionForce[typeI](d);
        } else {
            if (typeI == 0) {
                return 0.2 / d;
            }
            if (typeI == 1) {
                return 0.2 / d;
            }
            if (typeI == 2) {
                return 0.2 / d;
            }
            if (typeI == 3) {
                return 0.2 / d;
            }
            if (typeI == 4) {
                return 0.2 / d;
            }

        }
    }

    // typeI が小さいほうにする
    if (typeI > typeJ) {
        let tmp = typeI;
        typeI = typeJ;
        typeJ = tmp;
    }

    if (typeI == 0) {
        if (typeJ == 1) {
            // return 4 / d;
            if (d < 20) {
                return -8 / d;
            } else {
                return 8 / d;
            }
        }
        if (typeJ == 2) {
            // return -2 / d;
            if (d < 30) {
                return -8 / d;
            } else {
                return 8 / d;
            }
        }
        if (typeJ == 3) {
            // return 2 / d;
            if (d < 40) {
                return -8 / d;
            } else {
                return 8 / d;
            }
        }
        if (typeJ == 4) {
            // return 2 / d;
            if (d < 50) {
                return -8 / d;
            } else {
                if (d < 75) {
                    return 8 / 50
                }

                return 8 / d
            }
        }
    }

    if (typeI == 1) {
        if (typeJ == 2) {
            // return 3 / d;
            if (d < 30) {
                return -3 / d;
            } else {
                return 3 / d;
            }
        }
        if (typeJ == 3) {
            // return 3 / d;
            if (d < 40) {
                return -3 / d;
            } else {
                return 3 / d;
            }
        }
        if (typeJ == 4) {
            // return 3 / d;
            if (d < 50) {
                return -3 / d;
            } else {
                return 3 / d;
            }
        }
    }

    if (typeI == 2) {
        if (typeJ == 3) {
            // return -3 / d;
            if (d < 40) {
                return -10 / d;
            } else {
                return -10 / d;
            }
        }
        if (typeJ == 4) {
            // return -3 / d;
            if (d < 50) {
                return -10 / d;
            } else {
                return -10 / d;
            }
        }
    }

    if (typeI == 3) {
        if (typeJ == 4) {
            // return 1 / d;
            if (d < 50) {
                return -4 / d;
            } else {
                return 4 / d;
            }
        }
    }
}


export const config = {
    numParticles: 3200,
    canvasWidth: 1600,
    canvasHeight: 800,
    particleTypes: 5,

    coef: 0.05,

    speedUpperBound: 1.5,
    speedLowerBound: 0.2,

    speedDecay: 0.95,
    speedGrowth: 1.05,

    computeForce: (typeI, typeJ, distance) => {
        return computeForce(typeI, typeJ, distance)
    },
};