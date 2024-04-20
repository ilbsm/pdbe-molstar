import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { Representation, RepresentationContext, RepresentationParamsGetter } from 'Molstar/mol-repr/representation';
import { Vec3 } from 'Molstar/mol-math/linear-algebra/3d';
import { MeshBuilder } from 'Molstar/mol-geo/geometry/mesh/mesh-builder';
import { RuntimeContext } from 'Molstar/mol-task';
import { ShapeRepresentation } from 'Molstar/mol-repr/shape/representation';
import { addSphere } from 'Molstar/mol-geo/geometry/mesh/builder/sphere';
import { addCylinder } from 'Molstar/mol-geo/geometry/mesh/builder/cylinder';
import { Color } from 'Molstar/mol-util/color/color';
import { Mesh } from 'Molstar/mol-geo/geometry/mesh/mesh';
import { Shape } from 'Molstar/mol-model/shape/shape';
import { DefaultCylinderProps } from 'Molstar/mol-geo/primitive/cylinder';

interface BondData {
    begin: Array<number>,
    end: Array<number>,
    size: number
    index: number,
    color: Array<number>
}

export const BondParams = {
    ...Mesh.Params,
    doubleSided: PD.Boolean(true)
};
export type BondParams = typeof BondParams;
export type BondProps = PD.Values<BondParams>

const BondVisuals = {
    'mesh': (ctx: RepresentationContext, getParams: RepresentationParamsGetter<BondData, BondParams>) => ShapeRepresentation(getBondShape, Mesh.Utils)
};

function getBondMesh(data: BondData, props: BondProps, mesh?: Mesh) {
    const state = MeshBuilder.createState(256, 128, mesh);
    state.currentGroup = 1;
    addSphere(state, Vec3.create(data.begin[0], data.begin[1], data.begin[2]), data.size, 3);
    addSphere(state, Vec3.create(data.end[0], data.end[1], data.end[2]), data.size, 3);
    addCylinder(state,
        Vec3.create(data.begin[0], data.begin[1], data.begin[2]),
        Vec3.create(data.end[0], data.end[1], data.end[2]),
        1,
        { ...DefaultCylinderProps, radiusTop: 0.4, radiusBottom: 0.4 });

    return MeshBuilder.getMesh(state);
}

function getBondShape(ctx: RuntimeContext, data: BondData, props: BondProps, shape?: Shape<Mesh>) {
    const geo = getBondMesh(data, props, shape && shape.geometry);
    return Shape.create(`Bond ${data.index}`, data, geo, () => Color.fromArray(data.color, 0), () => data.size, () => `Bond ${data.index}`);
}
export type BondRepresentation = Representation<BondData, BondParams>

export function BondRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<BondData, BondParams>): BondRepresentation {
    return Representation.createMulti('Bond', ctx, getParams, Representation.StateBuilder, BondVisuals as unknown as Representation.Def<BondData, BondParams>);
}