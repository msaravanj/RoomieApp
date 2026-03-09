import { Carousel, IconButton, Image } from "@chakra-ui/react";
import { Suspense } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const CarouselComp = (props) => {
  const slideCount = props.photos.length;

  return (
    <Carousel.Root slideCount={slideCount} maxW="xl" mx="auto">
      <Carousel.ItemGroup>
        {props.photos.map((photo) => (
          <Suspense key={photo.id} fallback={<div>Loading...</div>}>
            <Carousel.Item key={photo.id} index={photo.id}>
              <Image
                aspectRatio="16/9"
                src={photo.url}
                alt={`Room image - ${photo.id}`}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Carousel.Item>
          </Suspense>
        ))}
      </Carousel.ItemGroup>

      <Carousel.Control justifyContent="center" gap="4">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronLeft />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.Indicators />

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronRight />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
};

export default CarouselComp;
