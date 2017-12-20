# Archery

## Controls:
- move your cursor to aim the bow and left-click to place the bow
- move your cursor to aim the arrow and control its speed and left-click to fire the arrow
- left-click to retrieve your arrow and repeat the above two-steps to continue playing

## Features:
[x] projectile motion 
[x] sprite and tile-graphics for bow, arrow, crosshair, target, background, and grass
[x] arrow-target and arrow-ground collisions
[x] vertically moving target
[x] mouse control scheme

##### Features to Implement:
[ ] ammo system for arrow count
[ ] score system based on location of arrow-target impact
[ ] more complex target movement pattersn
[ ] increasing difficulty for every target that is successfully hit before arrows run out
[ ] different level backgrounds
[ ] pivoting the bow based on the location of the crosshair
[ ] rotating the arrow based on its velocity in flight
[ ] having the arrow get stuck in the target at whatever position it was in prior to hitting the target

##### Known Bugs List:
- if an arrow hits the very bottom of the target and the target hits the ground, the arrow will stick to the ground
- framerate can drop sharply for unknown reasons
- firing the arrow from right to left does not change the arrow's sprite
- the bow should not be able to be fired while it's under the ground
