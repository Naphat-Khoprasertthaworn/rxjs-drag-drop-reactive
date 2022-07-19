import './style.css';

import {
  of,
  map,
  Observable,
  fromEvent,
  tap,
  switchMap,
  from,
  merge,
} from 'rxjs';
import { finalize, mergeMap, takeUntil } from 'rxjs/operators';
console.clear();

function dragElement(element: HTMLElement) {
  const mousedown$ = fromEvent<MouseEvent>(element, 'mousedown').pipe(
    tap((event) => event.preventDefault())
  );

  const touchstart$ = fromEvent<TouchEvent>(element, 'touchstart').pipe(
    tap((event) => event.preventDefault())
  );

  const down$ = merge(mousedown$, touchstart$);
  let stateX = 0;
  let stateY = 0;

  const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
  const touchmove$ = fromEvent<TouchEvent>(document, 'touchmove');
  const move$ = merge(mousemove$, touchmove$);
  const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');
  const touchend$ = fromEvent<TouchEvent>(document, 'touchend');
  const up$ = merge(mouseup$, touchend$);

  const getClient = (event: MouseEvent | TouchEvent) => {
    let clientX: number;
    let clientY: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return { clientX, clientY };
  };

  return down$.pipe(
    switchMap((downEvent) => {
      let translate: { translateX: number; translateY: number };
      const clientDown = getClient(downEvent);

      return move$.pipe(
        tap((moveEvent) => {
          const clientMove = getClient(moveEvent);
          const translateX = clientMove.clientX - clientDown.clientX + stateX;
          const translateY = clientMove.clientY - clientDown.clientY + stateY;

          element.style.transform = `translate(${translateX}px,${translateY}px)`;
          translate = { translateX, translateY };
        }),
        finalize(() => {
          stateX = translate.translateX;
          stateY = translate.translateY;
          // console.log(stateX, stateY);
        }),
        takeUntil(up$)
      );
    })
  );
}

const elementList = document.querySelectorAll<HTMLElement>(`[data-draggable]`);

from(elementList.values())
  .pipe(mergeMap((element) => dragElement(element)))
  .subscribe();
// .subscribe((val) => console.log(val));
