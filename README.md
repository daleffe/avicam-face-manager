# Avicam Face Manager
Gerenciador de faciais Avicam, feito em **HTML**, **CSS** e **JavaScript** (_Vanilla_).

A aplicação é executada localmente e armazena **no navegador** os dispositivos cadastrados, realizando o comando de abertura de porta.

O desenvolvimento foi todo realizado usando o JavaScript, sem nenhuma biblioteca para este fim, mesclando práticas não recomendadas (_como o uso do **[onclick](https://www.w3schools.com/jsref/event_onclick.asp)** por exemplo_), recursos antigos (_como o [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)_) e práticas atuais como [desestruturação](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) e o recurso _[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)_.

Foram utilizadas os seguintes _frameworks_/bibliotecas visuais:
- [Pure.css](https://github.com/pure-css/pure/)
- [Alerts.css](https://github.com/gustavoquinalha/alerts-css)

## API
Foi desenvolvido um recurso para permitir que seja salvo um _link_ (por dispositivo) nos favoritos, para fazer a abertura direta da porta, sem a necessidade de acessar a interface de gerenciamento.

## Demonstração
A [página de demonstração](https://daleffe.github.io/avicam-face-manager/) serve apenas para visualização da estrutura, pois, como os faciais usam o protocolo HTTP e a página está hospedada em ambiente HTTPS, as requisições não são processadas adequadamente. Para testar adequadamente, baixe para sua máquina local e distribua a aplicação via rede, caso julgue necessário, [via servidor web ou serviço de hospedagem externo](https://github.com/daleffe/avicam-face-manager/wiki/).

## Tarefas
- [X] Enviar comando de abertura de porta
- [X] Gerar um link por dispositivo
- [ ] Permitir a edição de dispositivos
- [ ] Multi-idiomas
- [ ] Migrar para o AngularJS (_sim, só pra brincar..._)
- [ ] Converter em extensão para Chrome/Edge/Chromium-based
