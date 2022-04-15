# adjust map overlay starting with initial guess for sw, ne
# usage: ruby scale.rb

o = [42.0844339, -87.8495302, 42.108635, -87.7990617]
puts o.inspect

# center
cy = (o[0]+o[2])/2
cx = (o[1]+o[3])/2

# half height and width
h2 = (o[2]-o[0])/2
w2 = (o[3]-o[1])/2

#scale
s = 1.15

#offset map - overlay
dy = 42.0874475 - 42.0963895
dx = -87.8394651 - -87.8411865

sw = [dy+cy-h2*s, dx+cx-w2*s]
ne = [dy+cy+h2*s, dx+cx+w2*s]
puts "#{sw[0]}, #{sw[1]} #{ne[0]}, #{ne[1]}"