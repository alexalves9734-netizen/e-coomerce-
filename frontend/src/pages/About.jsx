import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import NewsLetter from "../components/NewsLetter";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"SOBRE"} text2={"NÓS"} />
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[450px]"
          src={assets.about_img}
          alt="about_img"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            A IF PARFUM nasceu do encontro entre duas paixões: a perfumaria e o sonho
            compartilhado por dois apaixonados por fragrâncias — Ingrid e Fernando (as iniciais por trás do nosso nome).
          </p>
          <p>
            Mais do que vender perfumes, criamos experiências olfativas únicas, capazes de despertar memórias e emoções.
          </p>
          <p>
            Acreditamos que perfume é mais do que cheiro — é memória, presença e identidade.
          </p>

          <b className="text-gray-800">Nossa Missão</b>
          <p>
            Tornar a perfumaria importada e árabe mais acessível, prática e especial.
          </p>
          <p>
            Oferecemos frações dos melhores perfumes do mundo, para que você possa encontrar sua fragrância ideal antes de investir no frasco grande.
          </p>
          <p>
            Cada detalhe aqui é pensado com carinho: desde a curadoria das fragrâncias até o atendimento personalizado,
            feito com o mesmo cuidado de quem escolhe um perfume para presentear alguém querido.
          </p>
          <p>
            Porque, no fim das contas, o perfume certo conta a sua história — com apenas um borrifo.
          </p>
          <p>✨ Seja bem-vindo(a) à IF PARFUM.</p>
          <p> Aqui, o seu perfume não é apenas uma escolha… é uma descoberta.</p>
        </div>
      </div>
      <div className=" text-xl py-4">
        <Title text1={"Por que os clientes"} text2={"escolhem a nossa perfumaria."} />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Garantia de Qualidade:</b>
          <p className=" text-gray-600">
            Perfumes 100% originais, importados e árabes, com garantia de procedência e qualidade premium.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Experiência Exclusiva:</b>
          <p className=" text-gray-600">
            Fragrâncias únicas, escolhidas para quem valoriza sofisticação, intensidade e longa duração.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Atendimento Premium:</b>
          <p className=" text-gray-600">
            Nosso atendimento é tão exclusivo quanto nossas fragrâncias — cada detalhe é pensado para que sua compra seja prática, segura e inesquecível.
          </p>
        </div>
      </div>
      <NewsLetter />
    </div>
  );
};

export default About;
