import numpy as np

# create coords
n = 50
nc = n*n*n
c = np.linspace(0,1,n)
cx = c[:,np.newaxis,np.newaxis]
cy = c[np.newaxis,:,np.newaxis]
cz = c[np.newaxis,np.newaxis,:]
zs = np.zeros((n, n, n))
cc = np.stack((cx + zs, cy + zs, cz + zs), axis=-1)
cr = np.reshape(cc, (-1, 3))

# to oklab
r, g, b = cr[:,0], cr[:,1], cr[:,2]

l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
l_ = l ** (1 / 3)
m_ = m ** (1 / 3)
s_ = s ** (1 / 3)
fl = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
fa = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
fb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
cro = np.stack((fl, fa, fb), axis=-1)

# max-min-dist
# start with white (cro[0]) and black (cro[-1])
distances = np.full(nc, float("inf"))

d2white = np.sum(np.square(cro-cro[0]),axis=1)
d2black = np.sum(np.square(cro-cro[-1]),axis=1)
distances = np.minimum(distances, d2white)
distances = np.minimum(distances, d2black)

# and 30 times -
prototypes = []
while len(prototypes)<30:
    i = np.argmax(distances)
    d2i = np.sum(np.square(cro-cro[i]),axis=1)
    distances = np.minimum(distances, d2i)
    #if cro[i][0]>0.5:
    if cr[i][0]*0.1+cr[i][1]*0.7+cr[i][2]*0.2>0.2:
        prototypes.append(i)

def tohex(num):
    if num==256: return "ff"
    chars = "0123456789abcdef"
    return chars[num//16]+chars[num%16]

# print out the colors
for i in prototypes:
    r,g,b = (cr[i]*256).astype(int)
    print([r,g,b])
    #print(f"#{tohex(r)}{tohex(g)}{tohex(b)}")

def linear_srgb_to_oklab(c):
    """Convert a linear sRGB tuple (r, g, b) to an Oklab tuple (L, a, b)."""
    r, g, b = c

    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

    l_ = l ** (1 / 3)
    m_ = m ** (1 / 3)
    s_ = s ** (1 / 3)

    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )

