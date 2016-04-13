'use strict';
function bulletCollision(level, bullets)
{
    for (var bulletIndex = 0; bulletIndex < bullets.bullet.length; bulletIndex++)
    {

        if (!bullets.bullet[bulletIndex])
        {
            continue;
        }

        for (var currentIndex = 0; currentIndex < level.spriteChart.length; currentIndex++)

        {
            if (level.spriteChart[currentIndex])
            {
                if (level.spriteChart[currentIndex])
                {
                    var bX = bullets.bullet[bulletIndex].position.x;
                    if (((bullets.bullet[bulletIndex].position.y + bullets.bullet[bulletIndex].height <= level.spriteChart[currentIndex].position.y) ||
                            (bullets.bullet[bulletIndex].position.y >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                            (bX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                            (bX + bullets.bullet[bulletIndex].width <= level.spriteChart[currentIndex].position.x)) === false)
                    {
                        if (level.spriteChart[currentIndex].collectable != 1)
                        {
                            bullets.removeBullet(bulletIndex);
                            level.hitTile(currentIndex);
                            break;
                        }
                    }
                }
            }

        }
    }

};

function bulletCollisionPlayer(player, bullets)
{
    var hit = false;
    for (var bulletIndex = 0; bulletIndex < bullets.bullet.length; bulletIndex++)
    {
        hit = false;
        if (!bullets.bullet[bulletIndex])
        {
            continue;
        }
        var bX = bullets.bullet[bulletIndex].position.x;
        if (((bullets.bullet[bulletIndex].position.y + bullets.bullet[bulletIndex].height <= player.getRealY()) ||
                (bullets.bullet[bulletIndex].position.y >= player.getRealY() + player.height) ||
                (bX >= player.getRealX() + player.width) ||
                (bX + bullets.bullet[bulletIndex].width <= player.getRealX())) === false)
        {
            bullets.removeBullet(bulletIndex);
            player.hitBullet();

            break;
        }
    }
};

function collisionHandling(level, player, dTfactor)
{
    var playerRealX = player.getRealX();
    var playerRealY = player.getRealY();
    var currentIndex;

    //console.log(level.spriteChart.length + " vs " + (level.nrSpritesWidth*level.nrSpritesHeight));

    for (var currentIndex = 0; currentIndex < level.spriteChart.length; currentIndex++)
    {
        if (level.spriteChart[currentIndex])
        {
            if (((playerRealY + player.shipHeight <= level.spriteChart[currentIndex].position.y) ||
                    (playerRealY >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                    (playerRealX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                    (playerRealX + player.width <= level.spriteChart[currentIndex].position.x)) === false)
            {
                if (level.spriteChart[currentIndex].collectable === 1)
                {
                    level.collect(currentIndex);
                    player.collected++;
                }
                else
                {

                    var w = (player.width + level.spriteChart[currentIndex].width) / 2;
                    var h = (player.shipHeight + level.spriteChart[currentIndex].height) / 2;
                    var dx = player.position.x - (level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width / 2);
                    var dy = player.position.y - (level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height / 2);

                    player.velocity_y = player.velocity_y * -0.1;
                    player.velocity_x = player.velocity_x * -0.1;
                    while (((playerRealY + player.shipHeight <= level.spriteChart[currentIndex].position.y) ||
                            (playerRealY >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                            (playerRealX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                            (playerRealX + player.width <= level.spriteChart[currentIndex].position.x)) === false)
                    {
                        player.updatePosition(dTfactor);
                        playerRealX = player.getRealX();
                        playerRealY = player.getRealY();
                    }
                    //Reduce the risk to get stuck by moving one more step
                    player.updatePosition(dTfactor);
                    player.velocity_y = player.velocity_y * -10;
                    player.velocity_x = player.velocity_x * -10;

                    var wy = w * dy;
                    var hx = h * dx;

                    if (wy > hx)
                    {
                        if (wy > -hx)
                        {
                            //console.log("UP");
                            player.velocity_y = player.velocity_y * -BOUNCE_FACTOR;
                            player.velocity_x = player.velocity_x * BOUNCE_FACTOR;
                            player.hit();

                        }
                        else
                        {
                            //console.log("LEFT");
                            player.velocity_x = player.velocity_x * -BOUNCE_FACTOR;
                            player.velocity_y = player.velocity_y * BOUNCE_FACTOR;
                            player.hit();
                        }
                    }
                    else
                    {
                        if (wy > -hx)
                        {
                            //console.log("RIGHT");
                            player.velocity_x = player.velocity_x * -BOUNCE_FACTOR;
                            player.velocity_y = player.velocity_y * BOUNCE_FACTOR;
                            player.hit();
                        }
                        else
                        {

                            player.velocity_y = player.velocity_y * -BOUNCE_FACTOR;
                            player.velocity_x = player.velocity_x * BOUNCE_FACTOR;
                            if (Math.abs(Math.sin(player.rotation)) > 0.4)
                            {
                                player.hit();

                            }
                        }
                    }
                }
                break;
            }
        }

    }
};
