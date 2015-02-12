# Landing page per les discussions del programa
Aquest projecte consisteix en una pàgina estàtica (HMTL + javascript + css) que serveixi de punt d'entrada a les discussions que es generarar a democracyOS dels continguts del programa.

Exiteixen dues versions:

* Landing page amb àrees temàtiques ([Exemple](http://marcbc.github.io/programa-arees/index.html))
  - Mostra el número de participacions en forma de comentaris per cada una de les discussions de les àrees temàtiques del programa.

* Landing page amb discussions territorials ([Exemple](http://marcbc.github.io/programa/index.html))
  - Mostra el número de participacions en forma de comentaris per cada una de les discussions de les àrees temàtiques del programa.
  - Mostra el número de participacions de les discussions territorials a nivell de districte, permeten baixar a nivell de barri.


## Configuració

En qualsevol dels dos casos, les configuracions a fer per portar les pàgines a un entorn de producció consisteixen en:
* Actualitzar la variable **democracyHost** amb la URL base del servidor de DemocracyOS al que estem atacant (p.ex. "http://programa-test.herokuapp.com")
* Actualitzasr les estructures de dades **districts** i **program** amb les lawId corresponents a cada una de les discussions. (p.ex. de http://programa-test.herokuapp.com/law/54d889bc1eaee3455707c881, *54d889bc1eaee3455707c881* correspondria a la lawId)